/**
 * Agent selection utility
 * Randomly selects one of the configured ElevenLabs agents
 */

const DEFAULT_AGENT_IDS = [
  'agent_6701kchmqsvdfbatrfm00qe5xjgj', // Eric
  'agent_4201kchpssmrfs0v6zrqt7g99dmq', // The Wolf
];

export function getRandomAgentId(): string {
  const agentIdsString = process.env.ELEVENLABS_AGENT_IDS;

  let agentIds: string[] = DEFAULT_AGENT_IDS;

  if (agentIdsString) {
    // Parse from environment variable
    const parsed = agentIdsString
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (parsed.length > 0) {
      agentIds = parsed;
    }
  }

  // Randomly select one
  const randomIndex = Math.floor(Math.random() * agentIds.length);
  return agentIds[randomIndex];
}

export function isSimulatedMode(): boolean {
  return process.env.SIMULATE_CALLS === 'true';
}
