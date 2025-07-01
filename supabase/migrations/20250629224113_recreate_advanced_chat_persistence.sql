-- Migration: Recreate advanced chat persistence (conversations & messages)
-- 1. Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;

DROP TABLE IF EXISTS conversations CASCADE;

-- 2. Create conversations table with correct foreign key to auth.users
CREATE TABLE
   conversations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
      user_id uuid REFERENCES auth.users (id) NOT NULL,
      created_at timestamp
      with
         time zone DEFAULT now (),
         updated_at timestamp
      with
         time zone DEFAULT now (),
         title text
   );

-- 3. Create messages table
CREATE TABLE
   messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
      conversation_id uuid REFERENCES conversations (id) ON DELETE CASCADE NOT NULL,
      sender text NOT NULL, -- 'user' or 'ai'
      content text NOT NULL,
      timestamp timestamp
      with
         time zone DEFAULT now (),
         suggestions jsonb,
         recipes jsonb
   );

-- 4. Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy for conversations
CREATE POLICY "Users can access their own conversations" ON conversations FOR ALL USING (user_id = auth.uid ());

-- 6. RLS Policy for messages
CREATE POLICY "Users can access their own messages" ON messages FOR ALL USING (
   conversation_id IN (
      SELECT
         id
      FROM
         conversations
      WHERE
         user_id = auth.uid ()
   )
);