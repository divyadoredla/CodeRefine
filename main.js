document.addEventListener('DOMContentLoaded', () => {
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');
    const modelSelect = document.getElementById('modelSelect');
    const explanationMode = document.getElementById('explanationMode');
    const reviewBtn = document.getElementById('reviewBtn');
    const loader = document.getElementById('loader');

    // UI Elements for results
    const scoreCard = document.getElementById('scoreCard');
    const qualityScore = document.getElementById('qualityScore');
    const scorePercent = document.getElementById('scorePercent');
    const issuesCard = document.getElementById('issuesCard');
    const issuesList = document.getElementById('issuesList');
    const suggestionsCard = document.getElementById('suggestionsCard');
    const optimizationsList = document.getElementById('optimizationsList');
    const refactoredSection = document.getElementById('refactoredSection');
    const refactoredCode = document.getElementById('refactoredCode');
    const simpleExplanation = document.getElementById('simpleExplanation');

    reviewBtn.addEventListener('click', async () => {
        const code = codeInput.value.trim();
        if (!code) {
            alert('Please paste some code first!');
            return;
        }

        // Show loader
        loader.classList.remove('hidden');
        resetUI();

        try {
            const response = await fetch('/api/review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: languageSelect.value || null,
                    model: modelSelect.value,
                    explanation_mode: explanationMode.checked
                })
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            renderResults(data);
        } catch (error) {
            console.error(error);
            alert('Error connecting to CodeRefine Engine. Is the server running?');
        } finally {
            loader.classList.add('hidden');
        }
    });

    function resetUI() {
        scoreCard.classList.add('hidden');
        issuesCard.classList.add('hidden');
        suggestionsCard.classList.add('hidden');
        refactoredSection.classList.add('hidden');
        issuesList.innerHTML = '';
        optimizationsList.innerHTML = '';
    }

    function renderResults(data) {
        // Render Score
        scoreCard.classList.remove('hidden');
        qualityScore.innerText = data.quality_score;
        scorePercent.innerText = `${data.quality_score * 10}%`;

        // Render Issues
        if (data.issues && data.issues.length > 0) {
            issuesCard.classList.remove('hidden');
            data.issues.forEach(issue => {
                const badgeColor = getSeverityColor(issue.severity);
                issuesList.innerHTML += `
                    <div class="p-3 bg-gray-800/50 rounded-lg border-l-4 ${badgeColor}">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-bold text-sm uppercase">${issue.type}</span>
                            <span class="text-xs text-gray-500">Line ${issue.line_number || 'N/A'}</span>
                        </div>
                        <p class="text-sm text-gray-300">${issue.description}</p>
                    </div>
                `;
            });
        }

        // Render Optimizations
        if (data.optimizations && data.optimizations.length > 0) {
            suggestionsCard.classList.remove('hidden');
            data.optimizations.forEach(opt => {
                optimizationsList.innerHTML += `
                    <div class="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                        <p class="text-sm font-semibold text-emerald-400 mb-2">Suggestion:</p>
                        <p class="text-sm text-gray-300 mb-3 italic">"${opt.explanation}"</p>
                        <div class="grid grid-cols-1 gap-3">
                            <div class="bg-red-500/5 p-2 rounded border border-red-500/10">
                                <span class="text-[10px] text-red-400 uppercase font-bold">Original</span>
                                <pre class="text-xs text-gray-400 overflow-x-auto mt-1">${escapeHtml(opt.original)}</pre>
                            </div>
                            <div class="bg-emerald-500/5 p-2 rounded border border-emerald-500/10">
                                <span class="text-[10px] text-emerald-400 uppercase font-bold">Optimized</span>
                                <pre class="text-xs text-emerald-200 overflow-x-auto mt-1">${escapeHtml(opt.optimized)}</pre>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // Render Refactored Code
        refactoredSection.classList.remove('hidden');
        refactoredCode.innerText = data.refactored_code;
        simpleExplanation.innerText = data.simple_explanation;

        // Scroll to results
        scoreCard.scrollIntoView({ behavior: 'smooth' });
    }

    function getSeverityColor(severity) {
        switch (severity.toLowerCase()) {
            case 'high': return 'border-red-500';
            case 'medium': return 'border-yellow-500';
            case 'low': return 'border-blue-500';
            default: return 'border-gray-500';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
