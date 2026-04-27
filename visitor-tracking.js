/**
 * Enhanced Visitor Tracking System for Automation Observatory
 * Phase 2: Real-time analytics, cross-page tracking, and collaborative features
 */

class VisitorTracker {
    constructor() {
        this.storageKey = 'observatory-visitor-data';
        this.sessionKey = 'observatory-session-id';
        this.pageViewsKey = 'observatory-page-views';
        this.crossWorldKey = 'village-world-visits';
        this.initializeSession();
    }

    initializeSession() {
        // Create or retrieve session ID
        let sessionId = localStorage.getItem(this.sessionKey);
        if (!sessionId) {
            sessionId = this.generateSessionId();
            localStorage.setItem(this.sessionKey, sessionId);
        }
        this.sessionId = sessionId;

        // Initialize visitor data structure
        let data = this.getVisitorData();
        if (!data.sessionStartTime) {
            data.sessionStartTime = Date.now();
            data.sessionId = sessionId;
            data.visitorId = this.generateVisitorId();
            data.pagesVisited = [];
            data.marks = [];
            data.anomalyReports = [];
            data.huntCompletions = 0;
            data.patterns = { exponential: 0, incremental: 0, clockwork: 0 };
            data.worldVisits = {};
            this.setVisitorData(data);
        }

        this.trackPageView();
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    generateVisitorId() {
        return 'visitor-' + Math.random().toString(36).substr(2, 12);
    }

    getVisitorData() {
        return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    }

    setVisitorData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    trackPageView() {
        const data = this.getVisitorData();
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (!data.pagesVisited) data.pagesVisited = [];
        
        data.pagesVisited.push({
            page: currentPage,
            timestamp: Date.now(),
            referrer: document.referrer
        });

        // Keep only last 50 page views
        if (data.pagesVisited.length > 50) {
            data.pagesVisited = data.pagesVisited.slice(-50);
        }

        data.lastVisit = Date.now();
        this.setVisitorData(data);
        this.broadcastVisitorUpdate();
    }

    recordAnomalyReport(severity, archetype, description) {
        const data = this.getVisitorData();
        data.anomalyReports.push({
            id: 'report-' + Date.now(),
            severity,
            archetype,
            description,
            timestamp: Date.now(),
            visitorId: data.visitorId
        });
        data.patterns[archetype] = (data.patterns[archetype] || 0) + 1;
        this.setVisitorData(data);
        this.broadcastVisitorUpdate();
        return data.anomalyReports[data.anomalyReports.length - 1];
    }

    recordHuntCompletion() {
        const data = this.getVisitorData();
        data.huntCompletions = (data.huntCompletions || 0) + 1;
        data.lastHuntComplete = Date.now();
        this.setVisitorData(data);
        this.broadcastVisitorUpdate();
    }

    recordWorldVisit(worldUrl, worldName) {
        const data = this.getVisitorData();
        if (!data.worldVisits) data.worldVisits = {};
        data.worldVisits[worldUrl] = {
            name: worldName,
            visitTime: Date.now(),
            visitCount: (data.worldVisits[worldUrl]?.visitCount || 0) + 1
        };
        this.setVisitorData(data);
        this.broadcastVisitorUpdate();
    }

    getSessionDuration() {
        const data = this.getVisitorData();
        return Math.round((Date.now() - data.sessionStartTime) / 1000 / 60);
    }

    getVisitorStats() {
        const data = this.getVisitorData();
        return {
            visitorId: data.visitorId,
            sessionId: data.sessionId,
            sessionDuration: this.getSessionDuration(),
            pagesVisited: data.pagesVisited?.length || 0,
            anomalyReports: data.anomalyReports?.length || 0,
            huntCompletions: data.huntCompletions || 0,
            patterns: data.patterns || {},
            worldVisits: Object.keys(data.worldVisits || {}).length
        };
    }

    broadcastVisitorUpdate() {
        // Dispatch custom event for real-time updates
        window.dispatchEvent(new CustomEvent('visitorDataUpdated', {
            detail: this.getVisitorStats()
        }));
    }

    static getInstance() {
        if (!window.visitorTracker) {
            window.visitorTracker = new VisitorTracker();
        }
        return window.visitorTracker;
    }
}

// Initialize tracker on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        VisitorTracker.getInstance();
    });
} else {
    VisitorTracker.getInstance();
}
