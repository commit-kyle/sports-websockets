import { eq } from 'drizzle-orm';
import { db, pool } from './db/db.js';
import { matches, commentary } from './db/schema.js';

async function main() {
  try {
    console.log('Performing CRUD operations for real-time sports app...');

    // CREATE: Insert a new match
    const [newMatch] = await db
      .insert(matches)
      .values({
        sport: 'Soccer',
        homeTeam: 'Team A',
        awayTeam: 'Team B',
        status: 'scheduled',
        startTime: new Date()
      })
      .returning();

    if (!newMatch) {
      throw new Error('Failed to create match');
    }
    
    console.log('✅ CREATE: New match created:', newMatch);

    // CREATE: Add commentary
    const [newCommentary] = await db
      .insert(commentary)
      .values({
        matchId: newMatch.id,
        minute: 10,
        message: 'Goal for Team A!',
        eventType: 'goal'
      })
      .returning();

    console.log('✅ CREATE: New commentary added:', newCommentary);

    // READ: Select the match
    const foundMatch = await db.select().from(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ READ: Found match:', foundMatch[0]);

    // UPDATE: Update match score
    const [updatedMatch] = await db
      .update(matches)
      .set({ homeScore: 1, status: 'live' })
      .where(eq(matches.id, newMatch.id))
      .returning();
    
    console.log('✅ UPDATE: Match updated:', updatedMatch);

    // DELETE: Remove the commentary and match
    await db.delete(commentary).where(eq(commentary.matchId, newMatch.id));
    await db.delete(matches).where(eq(matches.id, newMatch.id));
    console.log('✅ DELETE: Match and commentary deleted.');

    console.log('\nCRUD operations completed successfully.');
  } catch (error) {
    console.error('❌ Error performing CRUD operations:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('Database pool closed.');
    }
  }
}

main();
