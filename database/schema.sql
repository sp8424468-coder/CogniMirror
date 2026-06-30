-- CogniMirror PostgreSQL Database Schema

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email', -- 'email' or 'google'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- JOURNALS TABLE
CREATE TABLE IF NOT EXISTS journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Untitled Journal',
    audio_url TEXT,
    transcript TEXT,
    detected_language VARCHAR(50) DEFAULT 'en',
    confidence_score REAL,
    mood VARCHAR(50) DEFAULT 'neutral', -- 'happy', 'sad', 'anxious', 'calm', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COGNITIVE INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    journal_id UUID UNIQUE NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    summary TEXT,
    primary_emotion VARCHAR(100),
    emotion_score REAL,
    stress_level INT,
    confidence_level INT,
    energy_level INT,
    topics JSONB,
    cognitive_distortions JSONB,
    action_items JSONB,
    similar_journal_id UUID REFERENCES journals(id) ON DELETE SET NULL,
    similarity_explanation TEXT,
    behavioral_insight TEXT,
    previously_helpful_actions JSONB,
    emotion_details JSONB, -- detailed percentages of emotions: {"joy": 0.4, "anxiety": 0.5, "anger": 0.1}
    cognitive_patterns JSONB, -- list of detected cognitive distortions/patterns: ["catastrophizing", "all-or-nothing"]
    actionable_reflections JSONB, -- array of reflection prompts/actions: ["Try to reframe...", "Take 3 deep breaths..."]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_journal_id ON insights(journal_id);
