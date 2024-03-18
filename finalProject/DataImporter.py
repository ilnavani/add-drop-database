# Author: Brynn Jones and Ilina Navani
# CSC 353: Database Systems Final Project

# This file imports the data from the excel file into the database
import mysql.connector
import os
import glob
import lxml
import lxml.etree
from tabulate import tabulate
import pandas as pd


###############################
#####  Global Variables   #####
###############################

DB_USER = 'root'
DB_PASSWORD = ''
DB_HOST = 'localhost'
SCHEMA_FILE = 'finalProject.sql'
SCHEMA_NAME = 'finalProject'


###############################
##  Setting Up Connection  ####
###############################

def connect_to_database():
    """ Connects to the database and returns the connection object """

    try: 
        connection = mysql.connector.connect(user=DB_USER, password=DB_PASSWORD, host=DB_HOST)
        cursor = connection.cursor()
        return connection, cursor
    except mysql.connector.Error as error_descriptor:
        print("Failed connecting to database: {}".format(error_descriptor))
        exit(1)


###############################
######   SQL  Queries   #######
###############################

def insertCourses(connection, cursor, CRN, course_title, crs_sec, days, class_time, instructor):
    """ Inserts a course into the database """

    try:
        cursor.execute(
            "INSERT INTO courses VALUES (%s, %s, %s, %s, %s, %s);", 
            (
                CRN,
                course_title,
                crs_sec,
                days,
                class_time,
                instructor,
            ),
        )
        connection.commit()
    except mysql.connector.Error as error_descriptor:
        print("Failed to insert using database {}".format(error_descriptor))
        cursor.close()
        connection.close()
        exit(1)
    

#################################
###### Schema Insertion #########
#################################

def build_schema(connection, cursor):
    """ Builds the database schema"""
    file = open(SCHEMA_FILE, 'r')
    schema_string = file.read()
    file.close()

    try:
        for _ in cursor.execute(schema_string, multi=True):
            pass
    except mysql.connector.Error as error_descriptor:
        print("Failed creating database: {}".format(error_descriptor))
        cursor.close()
        connection.close()
        exit(1)

###############################
###### Data Insertion #########
###############################

def insert_values(connection, cursor):
    """ Inserts the values into the course table"""
    for filename in glob.glob("Schedule_11-16-23.xlsx"):
        df = pd.read_excel(filename, skiprows=1, sheet_name = 0)
        CRN2 = 0
    
        for i in range(len(df)):     
            CRN = int(df.iloc[i, 1])
            if CRN == CRN2:
                continue
            course_title = df.iloc[i,5]
            subject = df.iloc[i,2]
            num = str(df.iloc[i,3])
            section = str(df.iloc[i,4])
            crs_sec = subject + "-" + num + "-" + section
            days = df.iloc[i,6]
            class_time = df.iloc[i,7]
            instructor = df.iloc[i,8]
        
            if i != len(df)-1:
                CRN2 = int(df.iloc[i+1, 1])
                if CRN == CRN2:
                    days2 = df.iloc[i+1,6]
                    time2 = df.iloc[i+1,7]
            
                    days = days + "," + days2
                    class_time = class_time + ", " + time2
    
            insertCourses(connection, cursor, CRN, course_title, crs_sec, days, class_time, instructor)

            

def main():
    """ Main function """

    # Connect to the database and build schema
    connection, cursor = connect_to_database()
    build_schema(connection, cursor)

    # Reset the connection for the next set of operations
    connection.commit()
    cursor.close()
    cursor = connection.cursor()

    # Insert the values into the database
    insert_values(connection, cursor)

    connection.commit()
    cursor.close()
    print("Done")

    return 0

main()