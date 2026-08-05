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
    // 1. Render Card Pool
    var poolHTML = '<div class="card-pool-wrapper"><h3>Your Stage 1 Sorted Cards (Sandbox)</h3>' +
                   '<p><em>Click a card to select it (highlighted orange), then click any column below to place it. To move a card back here, click the <strong>✕</strong> on the card.</em></p>' +
                   '<div id="card-pool">';
    
    var cardId = 0;
    ['disagree', 'neutral', 'agree'].forEach(function(bin) {
        var label = bin === 'disagree' ? 'UNLIKE' : (bin === 'neutral' ? 'NEUTRAL' : 'LIKE');
        roughBins[bin].forEach(function(text) {
            cardId++;
            poolHTML += '<div class="pool-card bin-' + bin + '" id="card-' + cardId + '">' +
                        '<span class="remove-btn" onclick="returnCardToPool(event, this)">✕</span>' +
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
        { id: '0', cap: 8 },
        { id: '+1', cap: 5 },
        { id: '+2', cap: 4 },
        { id: '+3', cap: 3 },
        { id: '+4', cap: 2 }
    ];

    var gridHTML = '<div class="grid-layout">';
    cols.forEach(function(col) {
        gridHTML += '<div class="grid-col" data-col="' + col.id + '" data-cap="' + col.cap + '">' +
                    '<div class="col-header">' + col.id + '<br><small>(' + col.cap + ' max)</small></div>' +
                    '<div class="col-cards"></div>' +
                    '</div>';
    });
    gridHTML += '</div>';

    $('#grid-container').html(poolHTML + gridHTML);
    $('#btn-to-survey').removeClass('hidden');

    // Attach Event Handlers
    attachHandlers();
}

function attachHandlers() {
    // Card selection handler
    $(document).off('click', '.pool-card').on('click', '.pool-card', function(e) {
        e.stopPropagation();
        
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            selectedCard = null;
        } else {
            $('.pool-card').removeClass('selected');
            selectedCard = $(this);
            selectedCard.addClass('selected');
        }
    });

    // Column click handler to place selected card
    $(document).off('click', '.grid-col').on('click', '.grid-col', function(e) {
        if (!selectedCard) return;

        var colCards = $(this).find('.col-cards');
        var maxCap = parseInt($(this).attr('data-cap'));

        // If card is already in this column, do nothing
        if ($.contains(this, selectedCard[0])) return;

        if (colCards.children().length >= maxCap) {
            alert("This column is full! Max capacity for column " + $(this).attr('data-col') + " is " + maxCap + " cards.");
            return;
        }

        colCards.append(selectedCard);
        selectedCard.removeClass('selected');
        selectedCard = null;
    });
}

// Return a card directly to the Sandbox pool when ✕ is clicked
function returnCardToPool(event, btnElem) {
    event.stopPropagation();
    var card = $(btnElem).closest('.pool-card');
    card.removeClass('selected');
    $('#card-pool').append(card);
    selectedCard = null;
}

function goToSurvey() {
    $('#step-grid').addClass('hidden');
    $('#step-survey').removeClass('hidden');
}

function finishDemo() {
    $('#step-survey').addClass('hidden');
    $('#step-finish').removeClass('hidden');
}
