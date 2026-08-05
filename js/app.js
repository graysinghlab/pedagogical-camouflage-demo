var statements = [];
var currentIndex = 0;
var roughBins = { disagree: [], neutral: [], agree: [] };

$(document).ready(function() {
    loadSettings();
});

function loadSettings() {
    $.ajax({
        type: "GET",
        url: "settings.xml",
        dataType: "xml",
        success: function(xml) {
            statements = [];
            $(xml).find('statement').each(function() {
                statements.push($(this).text());
            });
            console.log("Loaded " + statements.length + " statements.");
        },
        error: function(xhr, status, error) {
            console.log("Error loading settings.xml: " + error);
        }
    });
}

function startStudy() {
    // Fallback if settings haven't loaded yet
    if (statements.length === 0) {
        loadSettings();
    }
    $('#step-intro').addClass('hidden');
    $('#step-rough').removeClass('hidden');
    showNextCard();
}

function showNextCard() {
    if (statements.length > 0 && currentIndex < statements.length) {
        $('#current-card').text(statements[currentIndex]);
        $('#card-num').text(currentIndex + 1);
    } else if (statements.length > 0 && currentIndex >= statements.length) {
        startGridSort();
    } else {
        $('#current-card').text("Loading statements... Click 'Begin Sorting' again if needed.");
    }
}

function sortRough(binType) {
    if (binType === -1) roughBins.disagree.push(statements[currentIndex]);
    if (binType === 0) roughBins.neutral.push(statements[currentIndex]);
    if (binType === 1) roughBins.agree.push(statements[currentIndex]);
    
    currentIndex++;
    showNextCard();
}

function startGridSort() {
    $('#step-rough').addClass('hidden');
    $('#step-grid').removeClass('hidden');
    buildGrid();
}

function buildGrid() {
    var cols = ['-4', '-3', '-2', '-1', '0', '+1', '+2', '+3', '+4'];
    var gridHTML = '';
    
    cols.forEach(function(col) {
        gridHTML += '<div class="grid-col"><div class="col-header">' + col + '</div></div>';
    });
    
    $('#grid-container').html(gridHTML);
    $('#btn-to-survey').removeClass('hidden');
}

function goToSurvey() {
    $('#step-grid').addClass('hidden');
    $('#step-survey').removeClass('hidden');
}

function finishDemo() {
    $('#step-survey').addClass('hidden');
    $('#step-finish').removeClass('hidden');
}
