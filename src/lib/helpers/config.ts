import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const client = createClient(process.env.PUBLIC_SUPABASE_URL!, process.env.SUPABASE_PRIVATE_KEY!);

// console.log(process.env.PUBLIC_SUPABASE_URL);
const dbConfig = {
	client,
	tableName: 'documents',
	embeddingColumnName: 'embedding',
	queryName: 'match_documents'
};

export { dbConfig, client as supabase_client };
