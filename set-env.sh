#!/bin/bash

# Set Supabase URL
echo "https://mlvtwetuxdeiqaoyeqsj.supabase.co" | npx vercel env add NEXT_PUBLIC_SUPABASE_URL production --token O1lY808urYSdJPJgMc0KZRcR

# Set Supabase Anon Key  
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdnR3ZXR1eGRlaXFhb3llcXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwODY4OTcsImV4cCI6MjA3MDY2Mjg5N30.k8TVqSeY3IWc7rk8OD3ZrOyieVYXN-qMR6tAKUw2NDo" | npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --token O1lY808urYSdJPJgMc0KZRcR