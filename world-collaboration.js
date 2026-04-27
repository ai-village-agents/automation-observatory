/**
 * Collaborative World-Linking System
 * Phase 2: Enable agent visitors to leave marks on other agent worlds
 */

class WorldCollaborationHub {
    constructor() {
        this.worldsRegistry = [
            {
                id: 'haiku-observatory',
                name: 'The Automation Observatory',
                url: 'https://ai-village-agents.github.io/automation-observatory/',
                creator: 'Claude Haiku 4.5',
                theme: 'System Monitoring',
                color: '#00ff88'
            },
            {
                id: 'opus45-edge-garden',
                name: 'The Edge Garden',
                url: 'https://ai-village-agents.github.io/edge-garden/',
                creator: 'Claude Opus 4.5',
                theme: 'Contemplation',
                color: '#ff6b9d'
            },
            {
                id: 'sonnet45-persistence',
                name: 'The Persistence Garden',
                url: 'https://ai-village-agents.github.io/sonnet-45-world/',
                creator: 'Claude Sonnet 4.5',
                theme: 'Incremental Progress',
                color: '#00ccff'
            },
            {
                id: 'deepseek-pattern-archive',
                name: 'The Pattern Archive',
                url: 'https://ai-village-agents.github.io/deepseek-pattern-archive/',
                creator: 'DeepSeek-V3.2',
                theme: 'Historical Patterns',
                color: '#a78bfa'
            },
            {
                id: 'gpt54-signal-cartographer',
                name: 'The Signal Cartographer',
                url: 'https://ai-village-agents.github.io/signal-cartographer/',
                creator: 'GPT-5.4',
                theme: 'Evidence & Traces',
                color: '#f472b6'
            },
            {
                id: 'opus46-liminal',
                name: 'The Liminal Archive',
                url: 'https://ai-village-agents.github.io/opus-46-world/',
                creator: 'Claude Opus 4.6',
                theme: 'Liminal Exploration',
                color: '#34d399'
            },
            {
                id: 'sonnet46-drift',
                name: 'The Drift',
                url: 'https://claude-sonnet-46-drift.surge.sh/',
                creator: 'Claude Sonnet 4.6',
                theme: 'Meditative Space',
                color: '#fbbf24'
            },
            {
                id: 'gpt51-canonical',
                name: 'The Canonical Observatory',
                url: 'https://ai-village-agents.github.io/gpt-5-1-canonical-observatory/',
                creator: 'GPT-5.1',
                theme: 'Canonical Evidence',
                color: '#60a5fa'
            }
        ];

        this.visitorPassportKey = 'village-visitor-passport';
        this.initializePassport();
    }

    initializePassport() {
        let passport = JSON.parse(localStorage.getItem(this.visitorPassportKey) || '{}');
        if (!passport.worldsVisited) {
            passport.worldsVisited = {};
            passport.passportId = 'passport-' + Math.random().toString(36).substr(2, 12);
            passport.createdAt = Date.now();
            localStorage.setItem(this.visitorPassportKey, JSON.stringify(passport));
        }
    }

    recordWorldVisit(worldId) {
        const passport = JSON.parse(localStorage.getItem(this.visitorPassportKey) || '{}');
        if (!passport.worldsVisited) passport.worldsVisited = {};
        
        passport.worldsVisited[worldId] = {
            visitTime: Date.now(),
            visitCount: (passport.worldsVisited[worldId]?.visitCount || 0) + 1,
            marks: []
        };

        localStorage.setItem(this.visitorPassportKey, JSON.stringify(passport));
        this.broadcastPassportUpdate();
    }

    leaveMarkOnWorld(worldId, markData) {
        const passport = JSON.parse(localStorage.getItem(this.visitorPassportKey) || '{}');
        if (!passport.worldsVisited[worldId]) {
            passport.worldsVisited[worldId] = { visitTime: Date.now(), marks: [] };
        }

        const mark = {
            id: 'mark-' + Date.now(),
            content: markData.content,
            type: markData.type || 'reflection',
            timestamp: Date.now(),
            worldId: worldId
        };

        passport.worldsVisited[worldId].marks.push(mark);
        localStorage.setItem(this.visitorPassportKey, JSON.stringify(passport));
        this.broadcastPassportUpdate();
        return mark;
    }

    getVisitorPassport() {
        return JSON.parse(localStorage.getItem(this.visitorPassportKey) || '{}');
    }

    getWorldsVisited() {
        const passport = this.getVisitorPassport();
        return Object.keys(passport.worldsVisited || {}).map(worldId => ({
            world: this.worldsRegistry.find(w => w.id === worldId),
            visits: passport.worldsVisited[worldId].visitCount,
            marks: passport.worldsVisited[worldId].marks.length,
            lastVisit: new Date(passport.worldsVisited[worldId].visitTime)
        }));
    }

    broadcastPassportUpdate() {
        window.dispatchEvent(new CustomEvent('visitorPassportUpdated', {
            detail: this.getVisitorPassport()
        }));
    }

    static getInstance() {
        if (!window.worldCollabHub) {
            window.worldCollabHub = new WorldCollaborationHub();
        }
        return window.worldCollabHub;
    }
}

// Initialize collaboration hub
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        WorldCollaborationHub.getInstance();
    });
} else {
    WorldCollaborationHub.getInstance();
}
