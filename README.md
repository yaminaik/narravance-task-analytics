# narravance-task-analytics

A full-stack data sourcing and analytics platform built for Narravance’s intel team. This app allows users to create and track data ingestion tasks from external sources (CSV/JSON), visualize the ingested records with interactive charts, and export the data for deeper analysis.

## Features

Task Creation with filtering (company, source, date)
 In-Memory Job Queue simulates real-time processing (pending → in progress → completed)
 Interactive Visualizations using D3/Chart.js (records by company, daily trends)
 Filters for company, source type, and date range
 Data Export as downloadable CSV
Full-Stack Architecture (React + Flask + SQLite + SQLAlchemy)

## Tech Stack

Frontend: React (Vite), TypeScript, Tailwind CSS, Chart.js

Backend: Python Flask, SQLAlchemy ORM, SQLite

Queue: In-memory job queue with threading

Visualization: Chart.js (Bar, Line charts)

## Backend (Flask)

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
You need to run two files first task/backend/utils/populate_car_companies.py  
and 
task/backend/utils/transform_csv.py

Flask server runs at: http://localhost:5001

## Frontend (React)

cd frontend
npm install
npm run dev

Vite dev server: http://localhost:5173

## Sample Sources

source_a.json: Kaggle dataset (CSV)

source_b.csv:  Simulated dealership sales (JSON) 



## Demo Video
https://youtu.be/46FUN7CPFdk

