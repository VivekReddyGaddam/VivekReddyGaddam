// World-building and consistency tracking module

class WorldState {
  constructor() {
    this.entities = new Map() // character, location, object states
    this.relationships = new Map() // relationships between entities
    this.history = [] // chronological events
    this.rules = [] // world rules and constraints
  }

  // Add or update an entity
  updateEntity(entityId, properties) {
    if (!this.entities.has(entityId)) {
      this.entities.set(entityId, {
        id: entityId,
        createdAt: new Date().toISOString(),
        ...properties
      })
    } else {
      const existing = this.entities.get(entityId)
      this.entities.set(entityId, { ...existing, ...properties })
    }
  }

  // Get entity state
  getEntity(entityId) {
    return this.entities.get(entityId)
  }

  // Add relationship between entities
  addRelationship(entity1, entity2, relationship) {
    const key = [entity1, entity2].sort().join('-')
    this.relationships.set(key, {
      entity1,
      entity2,
      relationship,
      establishedAt: new Date().toISOString()
    })
  }

  // Record an event in history
  recordEvent(event) {
    this.history.push({
      ...event,
      timestamp: new Date().toISOString()
    })
  }

  // Check consistency of a story segment
  checkConsistency(storySegment, context = {}) {
    const issues = []

    // Check entity consistency
    for (const [entityId, entity] of this.entities) {
      if (entity.status === 'dead' && storySegment.includes(entity.name)) {
        issues.push({
          type: 'character_death',
          entity: entity.name,
          message: `${entity.name} is referenced after death`,
          severity: 'high'
        })
      }
    }

    // Check temporal consistency
    const recentEvents = this.history.slice(-5)
    for (const event of recentEvents) {
      if (event.type === 'location_change' && context.currentLocation !== event.location) {
        issues.push({
          type: 'temporal_inconsistency',
          message: `Recent location change to ${event.location} conflicts with current scene`,
          severity: 'medium'
        })
      }
    }

    // Check rule violations
    for (const rule of this.rules) {
      if (rule.type === 'impossible_action' && storySegment.includes(rule.trigger)) {
        issues.push({
          type: 'rule_violation',
          rule: rule.name,
          message: `${rule.name}: ${rule.description}`,
          severity: 'high'
        })
      }
    }

    return issues
  }

  // Generate context for AI generation
  generateContext() {
    const activeEntities = Array.from(this.entities.values())
      .filter(entity => entity.status !== 'dead' && entity.status !== 'destroyed')

    const recentHistory = this.history.slice(-10)

    return {
      activeEntities,
      recentHistory,
      worldRules: this.rules
    }
  }

  // Export world state for persistence
  export() {
    return {
      entities: Array.from(this.entities.entries()),
      relationships: Array.from(this.relationships.entries()),
      history: this.history,
      rules: this.rules
    }
  }

  // Import world state
  import(data) {
    this.entities = new Map(data.entities)
    this.relationships = new Map(data.relationships)
    this.history = data.history
    this.rules = data.rules
  }
}

// Consistency checker utility
class ConsistencyChecker {
  constructor() {
    this.worldStates = new Map() // storyId -> WorldState
  }

  // Get or create world state for a story
  getWorldState(storyId) {
    if (!this.worldStates.has(storyId)) {
      this.worldStates.set(storyId, new WorldState())
    }
    return this.worldStates.get(storyId)
  }

  // Analyze story segment for consistency issues
  analyzeSegment(storyId, segment, context = {}) {
    const worldState = this.getWorldState(storyId)
    return worldState.checkConsistency(segment, context)
  }

  // Update world state based on story events
  updateWorldState(storyId, events) {
    const worldState = this.getWorldState(storyId)

    for (const event of events) {
      switch (event.type) {
        case 'entity_update':
          worldState.updateEntity(event.entityId, event.properties)
          break
        case 'relationship_change':
          worldState.addRelationship(event.entity1, event.entity2, event.relationship)
          break
        case 'story_event':
          worldState.recordEvent(event)
          break
        case 'rule_addition':
          worldState.rules.push(event.rule)
          break
      }
    }
  }

  // Generate enhanced prompt for AI with consistency context
  generateConsistentPrompt(storyId, basePrompt, currentContext = {}) {
    const worldState = this.getWorldState(storyId)
    const context = worldState.generateContext()

    // Add consistency instructions to prompt
    const consistencyInstructions = `
IMPORTANT: Maintain consistency with the established world state:

Active Entities: ${JSON.stringify(context.activeEntities, null, 2)}
Recent History: ${JSON.stringify(context.recentHistory, null, 2)}
World Rules: ${JSON.stringify(context.worldRules, null, 2)}

Ensure:
1. Dead or destroyed entities are not referenced unless being resurrected (with proper explanation)
2. Character relationships and personalities remain consistent
3. World rules and physics are not violated
4. Recent events are acknowledged and built upon

Original Prompt: ${basePrompt}
`

    return consistencyInstructions
  }

  // Clean up old world states (for memory management)
  cleanup(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge
    for (const [storyId, worldState] of this.worldStates) {
      const lastActivity = Math.max(
        ...worldState.history.map(h => new Date(h.timestamp).getTime()),
        new Date(worldState.entities.size > 0 ?
          Array.from(worldState.entities.values())[0].createdAt : 0).getTime()
      )

      if (lastActivity < cutoff) {
        this.worldStates.delete(storyId)
      }
    }
  }
}

// Singleton instance
const consistencyChecker = new ConsistencyChecker()

module.exports = {
  ConsistencyChecker,
  WorldState,
  consistencyChecker
}