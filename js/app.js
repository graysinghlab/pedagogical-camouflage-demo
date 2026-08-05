var statements = [];
var currentIndex = 0;
var roughBins = { disagree: [], neutral: [], agree: [] };
var selectedCard = null;

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
        }
    });
}

function startStudy() {
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
    }
}

function sortRough(binType) {
    var cardText = statements[currentIndex];
    if (binType === -1) roughBins.disagree.push(cardText);
    if (binType === 0) roughBins.neutral.push(cardText);
    if (binType === 1) roughBins.agree.push(cardText);
    
    currentIndex++;
    showNextCard();
}

function startGridSort() {
    $('#step-rough').addClass('hidden');
    $('#step-grid').removeClass('hidden');
    buildGrid();
}

function buildGrid() {
    // 1. Render Card Pool (Sandbox)
    var poolHTML = '<div class="card-pool-wrapper"><h3>Your Stage 1 Sorted Cards (Sandbox)</h3>' +
                   '<p><em>Click any card to select it, then click a column to place it. Click a placed card to send it back here!</em></p>' +
                   '<div id="card-pool" onclick="returnToPool(event)">';
    
    var cardId = 0;
    ['disagree', 'neutral', 'agree'].forEach(function(bin) {
        var label = bin === 'disagree' ? 'UNLIKE' : (bin === 'neutral' ? 'NEUTRAL' : 'LIKE');
        roughBins[bin].forEach(function(text) {
            cardId++;
            poolHTML += '<div class="pool-card bin-' + bin + '" id="card-' + cardId + '" onclick="selectCard(event, this)">' +
                        '<span class="tag">' + label + '</span> ' + text + '</div>';
        });
    });
    poolHTML += '</div></div>';

    // 2. Render Forced Grid Columns (36 Slots Total)
    var cols = [
        { id: '-4', cap: 2 },
        { id: '-3', cap: 3 },
        { id: '-2', cap: 4 },
        { id: '-1', cap: 5 },
        { id: '0', cap: 8 }, // Updated to 8 for 36 cards
        { id: '+1', cap: 5 },
        { id: '+2', cap: 4 },
        { id: '+3', cap: 3 },
        { id: '+4', cap: 2 }
    ];

    var gridHTML = '<div class="grid-layout">';
    cols.forEach(function(col) {
        gridHTML += '<div class="grid-col" data-col="' + col.id + '" data-cap="' + col.cap + '" onclick="placeSelectedCard(this)">' +
                    '<div class="col-header">' + col.id + '<br><small>(' + col.cap + ' max)</small></div>' +
                    '<div class="col-cards"></div>' +
                    '</div>';
    });
    gridHTML += '</div>';

    $('#grid-container').html(poolHTML + gridHTML);
    $('#btn-to-survey').removeClass('hidden');
}

// Select or unselect a card
function selectCard(event, elem) {
    event.stopPropagation(); // Prevents clicking card from triggering column click
    
    if (selectedCard && selectedCard[0] === elem) {
        // If clicking the already selected card, deselect it
        $(elem).removeClass('selected');
        selectedCard = null;
    } else {
        $('.pool-card').removeClass('selected');
        selectedCard = $(elem);
        selectedCard.addClass('selected');
    }
}

// Place selected card into a grid column
function placeSelectedCard(colElem) {
    if (!selectedCard) return;
    
    var colCards = $(colElem).find('.col-cards');
    var maxCap = parseInt($(colElem).attr('data-cap'));
    
    // Check if column is already full
    if (colCards.children().length >= maxCap && !$.contains(colElem, selectedCard[0])) {
        alert("This column is full! Max capacity for column " + $(colElem).attr('data-col') + " is " + maxCap + " cards.");
        return;
    }

    colCards.append(selectedCard);
    selectedCard.removeClass('selected');
    selectedCard = null;
}

// Return a selected card back to the sandbox pool
function returnToPool(event) {
    if (selectedCard && !$.contains($('#card-pool')[0], selectedCard[0])) {
        $('#card-pool').append(selectedCard);
        selectedCard.removeClass('selected');
        selectedCard = null;
    }
}

function goToSurvey() {
    $('#step-grid').addClass('hidden');
    $('#step-survey').removeClass('hidden');
}

function finishDemo() {
    $('#step-survey').addClass('hidden');
    $('#step-finish').removeClass('hidden');
}
