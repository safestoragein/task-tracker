-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    user_role VARCHAR(50) DEFAULT 'member' CHECK (user_role IN ('admin', 'member')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labels Table
CREATE TABLE IF NOT EXISTS labels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'review', 'done', 'backlog')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    estimated_hours INTEGER,
    labels TEXT[] DEFAULT '{}',
    subtasks JSONB DEFAULT '[]',
    comments JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Reports Table
CREATE TABLE IF NOT EXISTS daily_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed JSONB DEFAULT '[]',
    tasks_in_progress JSONB DEFAULT '[]',
    blockers TEXT[] DEFAULT '{}',
    notes TEXT,
    yesterday_work TEXT,
    today_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(author_id, date)
);

-- Insert Team Members
INSERT INTO team_members (id, name, role, email, user_role) VALUES 
('1', 'Kushal', 'Tech Manager', 'kushal@safestorage.in', 'admin'),
('2', 'Niranjan', 'QA Manager', 'niranjan@safestorage.in', 'admin'),
('3', 'Anush', 'Logistics Manager', 'anush@safestorage.in', 'member'),
('4', 'Harsha', 'Operations Manager', 'harsha@safestorage.in', 'member'),
('5', 'Kiran', 'Technical Architect', 'kiran@safestorage.in', 'member'),
('6', 'Manish', 'HR', 'manish@safestorage.in', 'admin'),
('7', 'Ramesh', 'CEO', 'ramesh@safestorage.in', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert Labels
INSERT INTO labels (id, name, color) VALUES 
('1', 'Bug', '#ef4444'),
('2', 'Feature', '#3b82f6'),
('3', 'Enhancement', '#8b5cf6'),
('4', 'Documentation', '#10b981'),
('5', 'Research', '#f59e0b'),
('6', 'Backend', '#6366f1'),
('7', 'Frontend', '#06b6d4'),
('8', 'Mobile', '#84cc16'),
('9', 'DevOps', '#f97316'),
('10', 'Marketing', '#ec4899'),
('11', 'Logistics', '#8b5cf6'),
('12', 'Payment', '#eab308'),
('13', 'CRM', '#22c55e'),
('14', 'Legal', '#64748b'),
('15', 'Analytics', '#a855f7')
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using anon key)
CREATE POLICY "Enable read access for all users" ON team_members FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON team_members FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON labels FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON labels FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON tasks FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON daily_reports FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON daily_reports FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_daily_reports_updated_at BEFORE UPDATE ON daily_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();