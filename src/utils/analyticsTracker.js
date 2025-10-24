/**
 * Analytics Tracker Module
 * Tracks meme generation, sharing, and user activity
 * All data stored in localStorage with timestamp-based analytics
 */

const STORAGE_KEYS = {
  MEME_GENERATION: 'meme_analytics_generation',
  SHARE_ACTIVITY: 'meme_analytics_shares',
  POPULAR_TOPICS: 'meme_analytics_topics',
  PLATFORM_STATS: 'meme_analytics_platforms',
  DAILY_STATS: 'meme_analytics_daily',
  HISTORY: 'memeHistory'
};

class AnalyticsTracker {
  /**
   * Track a new meme generation
   */
  static trackMemeGeneration(topic, template, quality = 'medium') {
    const generation = {
      id: Date.now(),
      topic: topic || 'Unknown',
      template: template || 'Unknown',
      quality: quality,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      shares: 0,
      shared_platforms: []
    };

    const generations = this.getGenerations();
    generations.push(generation);
    localStorage.setItem(STORAGE_KEYS.MEME_GENERATION, JSON.stringify(generations));

    // Update daily stats
    this.updateDailyStats('generated', 1);
    // Update topic popularity
    this.updateTopicPopularity(topic);

    return generation.id;
  }

  /**
   * Track a share event
   */
  static trackShare(platform) {
    const platform_name = platform.toLowerCase();
    const shares = this.getPlatformStats();

    if (!shares[platform_name]) {
      shares[platform_name] = {
        name: platform,
        count: 0,
        timestamps: []
      };
    }

    shares[platform_name].count += 1;
    shares[platform_name].timestamps.push(new Date().toISOString());

    localStorage.setItem(STORAGE_KEYS.PLATFORM_STATS, JSON.stringify(shares));
    this.updateDailyStats('shared', 1);

    return shares[platform_name].count;
  }

  /**
   * Track multiple shares (batch operation)
   */
  static trackBatchShares(platforms) {
    platforms.forEach(platform => {
      this.trackShare(platform);
    });
  }

  /**
   * Get all meme generations
   */
  static getGenerations() {
    const data = localStorage.getItem(STORAGE_KEYS.MEME_GENERATION);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get platform sharing statistics
   */
  static getPlatformStats() {
    const data = localStorage.getItem(STORAGE_KEYS.PLATFORM_STATS);
    return data ? JSON.parse(data) : {};
  }

  /**
   * Get popular topics
   */
  static getPopularTopics(limit = 10) {
    const data = localStorage.getItem(STORAGE_KEYS.POPULAR_TOPICS);
    const topics = data ? JSON.parse(data) : {};

    return Object.entries(topics)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([topic, data]) => ({
        topic,
        count: data.count,
        lastUsed: data.lastUsed
      }));
  }

  /**
   * Get daily statistics
   */
  static getDailyStats(days = 30) {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    const stats = data ? JSON.parse(data) : {};

    const today = new Date();
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();

      result.push({
        date: dateStr,
        generated: stats[dateStr]?.generated || 0,
        shared: stats[dateStr]?.shared || 0
      });
    }

    return result;
  }

  /**
   * Get overall statistics summary
   */
  static getSummaryStats() {
    const generations = this.getGenerations();
    const platforms = this.getPlatformStats();
    const topics = this.getPopularTopics(5);

    const totalShares = Object.values(platforms).reduce((sum, p) => sum + p.count, 0);
    const topPlatform = Object.entries(platforms).sort((a, b) => b[1].count - a[1].count)[0];

    return {
      totalGenerated: generations.length,
      totalShares: totalShares,
      topPlatform: topPlatform ? topPlatform[0] : null,
      topPlatformCount: topPlatform ? topPlatform[1].count : 0,
      popularTopics: topics,
      qualityDistribution: this.getQualityDistribution(),
      weeklyTrend: this.getDailyStats(7)
    };
  }

  /**
   * Get quality level distribution
   */
  static getQualityDistribution() {
    const generations = this.getGenerations();
    const distribution = {
      high: 0,
      medium: 0,
      low: 0
    };

    generations.forEach(gen => {
      const quality = gen.quality || 'medium';
      if (distribution.hasOwnProperty(quality)) {
        distribution[quality]++;
      }
    });

    return distribution;
  }

  /**
   * Get sharing platform breakdown
   */
  static getPlatformBreakdown() {
    const platforms = this.getPlatformStats();
    const total = Object.values(platforms).reduce((sum, p) => sum + p.count, 0);

    return Object.entries(platforms).map(([key, data]) => ({
      platform: data.name,
      count: data.count,
      percentage: total > 0 ? ((data.count / total) * 100).toFixed(1) : 0
    }));
  }

  /**
   * Get meme generation timeline (last N days)
   */
  static getGenerationTimeline(days = 7) {
    const generations = this.getGenerations();
    const today = new Date();

    const timeline = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      timeline[dateStr] = 0;
    }

    generations.forEach(gen => {
      const genDate = new Date(gen.timestamp).toLocaleDateString();
      if (timeline.hasOwnProperty(genDate)) {
        timeline[genDate]++;
      }
    });

    return Object.entries(timeline)
      .reverse()
      .map(([date, count]) => ({
        date,
        count
      }));
  }

  /**
   * Get top templates by usage
   */
  static getTopTemplates(limit = 5) {
    const generations = this.getGenerations();
    const templates = {};

    generations.forEach(gen => {
      const template = gen.template || 'Unknown';
      if (!templates[template]) {
        templates[template] = 0;
      }
      templates[template]++;
    });

    return Object.entries(templates)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([template, count]) => ({
        template,
        count
      }));
  }

  /**
   * Export analytics as JSON
   */
  static exportJSON() {
    const data = {
      exportDate: new Date().toISOString(),
      summary: this.getSummaryStats(),
      generations: this.getGenerations(),
      platformStats: this.getPlatformStats(),
      popularTopics: this.getPopularTopics(),
      dailyStats: this.getDailyStats(30)
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export analytics as CSV
   */
  static exportCSV() {
    const generations = this.getGenerations();
    let csv = 'Date,Topic,Template,Quality,Shares,Shared Platforms\n';

    generations.forEach(gen => {
      const date = new Date(gen.timestamp).toLocaleString();
      const topic = (gen.topic || '').replace(/,/g, ';');
      const template = (gen.template || '').replace(/,/g, ';');
      const platforms = (gen.shared_platforms || []).join(';');

      csv += `"${date}","${topic}","${template}","${gen.quality}","${gen.shares}","${platforms}"\n`;
    });

    return csv;
  }

  /**
   * Get statistics for a specific date range
   */
  static getDateRangeStats(startDate, endDate) {
    const generations = this.getGenerations();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const filtered = generations.filter(gen => {
      const genTime = new Date(gen.timestamp).getTime();
      return genTime >= start && genTime <= end;
    });

    return {
      total: filtered.length,
      topics: this.aggregateTopics(filtered),
      templates: this.aggregateTemplates(filtered)
    };
  }

  /**
   * Clear all analytics data
   */
  static clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Reset data for current day
   */
  static resetDailyData() {
    localStorage.removeItem(STORAGE_KEYS.DAILY_STATS);
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Update topic popularity tracking
   */
  static updateTopicPopularity(topic) {
    if (!topic) return;

    const topics = this.getPopularTopics(1000); // Get all
    const topicsObj = {};

    topics.forEach(t => {
      topicsObj[t.topic] = {
        count: t.count,
        lastUsed: t.lastUsed
      };
    });

    if (!topicsObj[topic]) {
      topicsObj[topic] = {
        count: 0,
        lastUsed: null
      };
    }

    topicsObj[topic].count += 1;
    topicsObj[topic].lastUsed = new Date().toISOString();

    localStorage.setItem(STORAGE_KEYS.POPULAR_TOPICS, JSON.stringify(topicsObj));
  }

  /**
   * Update daily statistics
   */
  static updateDailyStats(type, value) {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_STATS);
    const stats = data ? JSON.parse(data) : {};

    const today = new Date().toLocaleDateString();

    if (!stats[today]) {
      stats[today] = {
        generated: 0,
        shared: 0
      };
    }

    if (type === 'generated') {
      stats[today].generated += value;
    } else if (type === 'shared') {
      stats[today].shared += value;
    }

    localStorage.setItem(STORAGE_KEYS.DAILY_STATS, JSON.stringify(stats));
  }

  /**
   * Aggregate topics from generations
   */
  static aggregateTopics(generations) {
    const topics = {};

    generations.forEach(gen => {
      const topic = gen.topic || 'Unknown';
      topics[topic] = (topics[topic] || 0) + 1;
    });

    return Object.entries(topics)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, count]) => ({
        topic,
        count
      }));
  }

  /**
   * Aggregate templates from generations
   */
  static aggregateTemplates(generations) {
    const templates = {};

    generations.forEach(gen => {
      const template = gen.template || 'Unknown';
      templates[template] = (templates[template] || 0) + 1;
    });

    return Object.entries(templates)
      .sort((a, b) => b[1] - a[1])
      .map(([template, count]) => ({
        template,
        count
      }));
  }
}

export default AnalyticsTracker;
