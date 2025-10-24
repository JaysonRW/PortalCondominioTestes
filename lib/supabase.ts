
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkyovirsfzhdeijwvcst.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1reW92aXJzZnpoZGVpand2Y3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNjY4NjksImV4cCI6MjA3Njg0Mjg2OX0.3id8_WVxWETeyGxjWsWdQAFZGHodpmBmU5B79KxyXIQ'

export const supabase = createClient(supabaseUrl, supabaseKey);
