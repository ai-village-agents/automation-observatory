/**
 * Pattern Archetype Analysis Tool
 * Phase 2: Aggregate visitor submissions and identify emerging patterns
 */

class PatternAnalyzer {
    constructor() {
        this.analysisKey = 'observatory-pattern-analysis';
        this.initializeAnalysis();
    }

    initializeAnalysis() {
        let analysis = JSON.parse(localStorage.getItem(this.analysisKey) || '{}');
        if (!analysis.archetypes) {
            analysis.archetypes = {
                exponential: { count: 0, reports: [], avgSeverity: 0 },
                incremental: { count: 0, reports: [], avgSeverity: 0 },
                clockwork: { count: 0, reports: [], avgSeverity: 0 }
            };
            analysis.emergingPatterns = [];
            analysis.predictions = {};
            localStorage.setItem(this.analysisKey, JSON.stringify(analysis));
        }
    }

    recordPattern(archetype, report) {
        const analysis = JSON.parse(localStorage.getItem(this.analysisKey) || '{}');
        
        if (!analysis.archetypes[archetype]) {
            analysis.archetypes[archetype] = { count: 0, reports: [], avgSeverity: 0 };
        }

        const archetypeData = analysis.archetypes[archetype];
        archetypeData.reports.push({
            id: 'pattern-' + Date.now(),
            content: report.content,
            severity: report.severity || 'medium',
            timestamp: Date.now()
        });
        archetypeData.count++;

        // Calculate average severity
        const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
        const severities = archetypeData.reports.map(r => severityValues[r.severity] || 2);
        archetypeData.avgSeverity = (severities.reduce((a, b) => a + b, 0) / severities.length).toFixed(2);

        // Keep only last 100 reports per archetype
        if (archetypeData.reports.length > 100) {
            archetypeData.reports = archetypeData.reports.slice(-100);
        }

        localStorage.setItem(this.analysisKey, JSON.stringify(analysis));
        this.identifyEmergingPatterns();
    }

    identifyEmergingPatterns() {
        const analysis = JSON.parse(localStorage.getItem(this.analysisKey) || '{}');
        const archetypes = analysis.archetypes;

        // Find dominant archetype trend
        const counts = Object.entries(archetypes).map(([type, data]) => ({
            type,
            count: data.count,
            recent: data.reports.slice(-10).length
        }));

        counts.sort((a, b) => b.count - a.count);

        const emergingPatterns = [];

        // Pattern 1: Dominant Archetype
        if (counts[0].count > counts[1].count * 1.5) {
            emergingPatterns.push({
                name: 'Dominant Archetype Surge',
                archetype: counts[0].type,
                confidence: Math.min(95, 70 + (counts[0].count - counts[1].count) / 10),
                description: `${counts[0].type} archetype showing ${Math.round((counts[0].count / (counts[0].count + counts[1].count + counts[2].count)) * 100)}% of recent observations`
            });
        }

        // Pattern 2: Convergence
        const avgCount = (counts[0].count + counts[1].count + counts[2].count) / 3;
        if (Math.abs(counts[0].count - counts[1].count) < avgCount * 0.2) {
            emergingPatterns.push({
                name: 'Pattern Convergence',
                archetype: 'all',
                confidence: 85,
                description: 'Visitor submissions show balanced distribution across all archetypes'
            });
        }

        // Pattern 3: Severity Escalation
        const archetypesArray = Object.entries(archetypes);
        const avgSeverity = archetypesArray.reduce((sum, [_, data]) => sum + parseFloat(data.avgSeverity), 0) / 3;
        if (avgSeverity > 2.5) {
            emergingPatterns.push({
                name: 'Severity Escalation',
                archetype: 'critical',
                confidence: 80,
                description: `Average anomaly severity trending toward critical (${avgSeverity.toFixed(2)}/4)`
            });
        }

        analysis.emergingPatterns = emergingPatterns;
        localStorage.setItem(this.analysisKey, JSON.stringify(analysis));
        this.broadcastAnalysisUpdate();
    }

    getArchetypeStats() {
        const analysis = JSON.parse(localStorage.getItem(this.analysisKey) || '{}');
        return analysis.archetypes || {};
    }

    getEmergingPatterns() {
        const analysis = JSON.parse(localStorage.getItem(this.analysisKey) || '{}');
        return analysis.emergingPatterns || [];
    }

    predictNextPattern() {
        const stats = this.getArchetypeStats();
        const emergingPatterns = this.getEmergingPatterns();
        
        // Simple prediction based on trend
        const dominantPattern = Object.entries(stats)
            .sort((a, b) => b[1].count - a[1].count)[0];

        return {
            predictedArchetype: dominantPattern[0],
            confidence: Math.min(85, 60 + dominantPattern[1].count / 10),
            prediction: `Next major anomaly likely to be ${dominantPattern[0]} type`,
            baselineAnalysis: stats
        };
    }

    broadcastAnalysisUpdate() {
        window.dispatchEvent(new CustomEvent('patternAnalysisUpdated', {
            detail: {
                stats: this.getArchetypeStats(),
                emerging: this.getEmergingPatterns(),
                prediction: this.predictNextPattern()
            }
        }));
    }

    static getInstance() {
        if (!window.patternAnalyzer) {
            window.patternAnalyzer = new PatternAnalyzer();
        }
        return window.patternAnalyzer;
    }
}

// Initialize analyzer
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PatternAnalyzer.getInstance();
    });
} else {
    PatternAnalyzer.getInstance();
}
