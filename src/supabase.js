import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://sojlmigvbtmmnadlmncc.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_iHF5MBS5CWgJc1ED8bSZug_ZZoFcrCK'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
