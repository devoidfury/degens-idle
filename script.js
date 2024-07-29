

let copium = 0;
let copiumPerSecond = 0;
let delusion = 0;
let delusionPerSecond = 0;
let yachtMoney = 0;
let yachtMoneyPerSecond = 0;
let trollPoints = 0;
let trollPointsPerSecond = 0;
let hopium = 0;
let hopiumPerSecond = 0;
let cooldowns = {
    copium: false,
    delusion: false,
    yachtMoney: false,
    trollPoints: false
};

let effectiveCopiumPerSecond = 0;
let effectiveDelusionPerSecond = 0;
let effectiveYachtMoneyPerSecond = 0;
let effectiveTrollPointsPerSecond = 0;
let effectiveHopiumPerSecond = 0;

let prestiges = 0;
let epsMultiplier = 1;
let prestigeRequirement = 1000;
let purchasedUpgrades = [];

let godModeLevel = 0;
let godModeMultiplier = 1;

let firstTimePrestigeButtonAvailable = true; // Default to true, will be updated based on saved state
let firstTimeCookieUnlock = true;

let modalQueue = [];
let isModalOpen = false;

// Mini-game timeouts in milliseconds
const miniGameTimeouts = {
    speed: 10 * 60 * 1000,  // 10 minutes
    memory: 5 * 60 * 1000,  // 5 minutes
    math: 7 * 60 * 1000,    // 7 minutes
    luck: 3 * 60 * 1000     // 3 minutes
};

function updateEffectiveMultipliers() {
    effectiveCopiumPerSecond = copiumPerSecond * epsMultiplier * godModeMultiplier;
    effectiveDelusionPerSecond = delusionPerSecond * epsMultiplier * godModeMultiplier;
    effectiveYachtMoneyPerSecond = yachtMoneyPerSecond * epsMultiplier * godModeMultiplier;
    effectiveTrollPointsPerSecond = trollPointsPerSecond * epsMultiplier * godModeMultiplier;
    effectiveHopiumPerSecond = hopiumPerSecond * epsMultiplier * godModeMultiplier;
}


// Function to handle cookie click
function collectAllResources() {
    copium += 10 * epsMultiplier * godModeMultiplier;
    delusion += 10 * epsMultiplier * godModeMultiplier;
    yachtMoney += 10 * epsMultiplier * godModeMultiplier;
    trollPoints += 10 * epsMultiplier * godModeMultiplier;
    updateDisplay();
}

// Function to collect a specific resource and update the game state
function collectResource(resource) {
    // Increase the appropriate resource by the epsMultiplier
    if (resource === 'copium') copium += epsMultiplier * godModeMultiplier;
    if (resource === 'delusion') delusion += epsMultiplier * godModeMultiplier;
    if (resource === 'yachtMoney') yachtMoney += epsMultiplier * godModeMultiplier;
    if (resource === 'trollPoints') trollPoints += epsMultiplier * godModeMultiplier;
    
    // Update the display to reflect the new resource values
    updateDisplay();
}

// Function to load the game state from local storage
function loadGameState() {
    // Retrieve and parse the resource values from local storage, defaulting to 0 if not found
    copium = parseFloat(localStorage.getItem('copium')) || 0;
    copiumPerSecond = parseFloat(localStorage.getItem('copiumPerSecond')) || 0;
    delusion = parseFloat(localStorage.getItem('delusion')) || 0;
    delusionPerSecond = parseFloat(localStorage.getItem('delusionPerSecond')) || 0;
    yachtMoney = parseFloat(localStorage.getItem('yachtMoney')) || 0;
    yachtMoneyPerSecond = parseFloat(localStorage.getItem('yachtMoneyPerSecond')) || 0;
    trollPoints = parseFloat(localStorage.getItem('trollPoints')) || 0;
    trollPointsPerSecond = parseFloat(localStorage.getItem('trollPointsPerSecond')) || 0;
    hopium = parseFloat(localStorage.getItem('hopium')) || 0;
    hopiumPerSecond = parseFloat(localStorage.getItem('hopiumPerSecond')) || 0;
    
    // Retrieve and parse the prestige values from local storage, defaulting to 0 or 1 if not found
    prestiges = parseInt(localStorage.getItem('prestiges')) || 0;
    epsMultiplier = parseFloat(localStorage.getItem('epsMultiplier')) || 1;
    prestigeRequirement = parseFloat(localStorage.getItem('prestigeRequirement')) || 1000;

    // Retrieve and parse the god mode values from local storage, defaulting to 0 or 1 if not found
    godModeLevel = parseInt(localStorage.getItem('godModeLevel')) || 0;
    godModeMultiplier = parseFloat(localStorage.getItem('godModeMultiplier')) || 1;
    
    // Load the first time prestige button available flag
    firstTimePrestigeButtonAvailable = JSON.parse(localStorage.getItem('firstTimePrestigeButtonAvailable')) || true;

    // Retrieve the last interaction time, defaulting to the current time if not found
    const lastInteraction = parseInt(localStorage.getItem('lastInteraction')) || Date.now();

    // Retrieve and parse all upgrades with the isGodMode property from local storage
    const savedUpgrades = JSON.parse(localStorage.getItem('upgrades')) || [];
    
    // Restore the isGodMode property for each upgrade
    upgrades.forEach(upgrade => {
        const savedUpgrade = savedUpgrades.find(up => up.name === upgrade.name);
        if (savedUpgrade) {
            upgrade.isGodMode = savedUpgrade.isGodMode;
        }
    });

    // Retrieve and parse the purchased upgrades from local storage, defaulting to an empty array if not found
    const savedPurchasedUpgrades = JSON.parse(localStorage.getItem('purchasedUpgrades')) || [];
    
    // Map the saved purchased upgrade names to the actual upgrade objects
    purchasedUpgrades = savedPurchasedUpgrades.map(savedUpgradeName => upgrades.find(up => up.name === savedUpgradeName)).filter(Boolean);

    // Filter out the available upgrades that have been purchased
    availableUpgrades = upgrades.filter(upgrade => !purchasedUpgrades.includes(upgrade));

    // Reapply the purchased upgrades and handle any special cases (e.g., "Cookie Clicker")
    purchasedUpgrades.forEach(upgrade => {
        if (upgrade) {
            addPurchasedUpgrade(upgrade.img, upgrade.name, upgrade.earnings, upgrade.isGodMode);
            if (upgrade.name === "Cookie Clicker") {
                document.getElementById('cookieButton').style.display = 'block';
                firstTimeCookieUnlock = false; // Indicate that the cookie button has been previously unlocked
            }
        }
    });

    // Load the state of the Cookie Clicker button
    const cookieButtonVisible = JSON.parse(localStorage.getItem('cookieButtonVisible'));
    if (cookieButtonVisible) {
        document.getElementById('cookieButton').style.display = 'block';
    }

    // Calculate the elapsed time since the last interaction
    const now = Date.now();
    const elapsedSeconds = (now - lastInteraction) / 1000;
    
    // Generate idle resources based on the elapsed time
    generateIdleResources(elapsedSeconds);

    // Update the display and the upgrade list, and unlock any available mini-games
    updateDisplay();
    updateUpgradeList();
    unlockMiniGames();
}




function saveGameState() {
    // Save the resource values to local storage
    localStorage.setItem('copium', copium);
    localStorage.setItem('copiumPerSecond', copiumPerSecond);
    localStorage.setItem('delusion', delusion);
    localStorage.setItem('delusionPerSecond', delusionPerSecond);
    localStorage.setItem('yachtMoney', yachtMoney);
    localStorage.setItem('yachtMoneyPerSecond', yachtMoneyPerSecond);
    localStorage.setItem('trollPoints', trollPoints);
    localStorage.setItem('trollPointsPerSecond', trollPointsPerSecond);
    localStorage.setItem('hopium', hopium);
    localStorage.setItem('hopiumPerSecond', hopiumPerSecond);
    
    // Save the prestige values to local storage
    localStorage.setItem('prestiges', prestiges);
    localStorage.setItem('epsMultiplier', epsMultiplier);
    localStorage.setItem('prestigeRequirement', prestigeRequirement);
    
    // Save the god mode values to local storage
    localStorage.setItem('godModeLevel', godModeLevel);
    localStorage.setItem('godModeMultiplier', godModeMultiplier);

    // Save the current time as the last interaction time
    localStorage.setItem('lastInteraction', Date.now());
    
    // Save all upgrades with the isGodMode property
    localStorage.setItem('upgrades', JSON.stringify(upgrades.map(upgrade => ({
        name: upgrade.name,
        isGodMode: upgrade.isGodMode || false
    }))));
    
    // Save the purchased upgrades
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades.map(upgrade => upgrade.name)));

    // Save the first time prestige button available flag
    localStorage.setItem('firstTimePrestigeButtonAvailable', firstTimePrestigeButtonAvailable);
    
    // Save the state of the Cookie Clicker button
    localStorage.setItem('cookieButtonVisible', document.getElementById('cookieButton').style.display === 'block');

}






// Generate resources based on elapsed time
function generateResources() {
    copium += effectiveCopiumPerSecond;
    delusion += effectiveDelusionPerSecond;
    yachtMoney += effectiveYachtMoneyPerSecond;
    trollPoints += effectiveTrollPointsPerSecond;
    hopium += effectiveHopiumPerSecond;
    updateDisplay();
}





// Function to play a mini-game of a given type
function playMiniGame(gameType) {
    // Check if the mini-game is on cooldown
    if (cooldowns[gameType]) return;

    // Get the button element for the mini-game
    const button = document.getElementById(`${gameType}Game`);
    button.disabled = true; // Disable the button at the start of the game
    button.classList.remove('affordable'); // Remove the 'affordable' class
    button.classList.add('disabled'); // Add the 'disabled' class to change its appearance

    // Speed mini-game logic
    if (gameType === 'speed') {
        let points = 0;
        let duration = Math.floor(Math.random() * 8) + 1; // Random duration between 1 and 8 seconds
        showMessageModal('Speed Game', `Tap on the screen as many times as you can in ${duration} seconds!`, false, false);

        // Function to handle clicks
        function clickHandler() {
            points++;
        }

        document.addEventListener('click', clickHandler); // Add click event listener
        document.addEventListener('touchstart', clickHandler); // Add touch event listener

        // End the game after the duration
        setTimeout(() => {
            document.removeEventListener('click', clickHandler); // Remove click event listener
            document.removeEventListener('touchstart', clickHandler); // Remove touch event listener
            let clicksPerSecond = points / duration;
            let reward;
            if (clicksPerSecond > 3) { // More than 3 clicks per second
                reward = Math.max(Math.floor(Math.abs(copium) * ((clicksPerSecond - 3) * 0.03)), 25);
                showMessageModal('Speed Game Result - Fast', `You tapped ${points} times in ${duration} seconds (${clicksPerSecond.toFixed(1)} taps per second). For being so fast you earned ${formatNumber(reward)} copium!`, false, false);
            } else {
                reward = -Math.max(Math.floor(Math.random() * Math.abs(copium) * 0.1), 10);
                showMessageModal('Speed Game Result - Slow', `You tapped ${points} times in ${duration} seconds (${clicksPerSecond.toFixed(1)} taps per second). For being so slow you lost ${formatNumber(reward)} copium!`, false, false);
            }
            copium += reward;
            updateDisplay(); // Update the display
            startCooldown(gameType); // Start cooldown for the mini-game
        }, duration * 1000);
    } else if (gameType === 'memory') {
        // Memory mini-game logic
        let sequenceLength = Math.floor(Math.random() * 6) + 3; // Random length between 3 and 8
        let sequence = '';
        for (let i = 0; i < sequenceLength; i++) {
            sequence += Math.floor(Math.random() * 10); // Random digit between 0 and 9
        }
        let timeout = Math.floor(Math.random() * 31) + 5; // Random timeout between 5 and 40 seconds
        showMessageModal('Memory Game', `Remember this sequence: ${sequence}`).then(() => {
            setTimeout(() => {
                showMessageModal('Memory Game', 'Enter the sequence:', false, false, true).then(userSequence => {
                    let correct = userSequence === sequence;
                    let reward = correct ? Math.max(Math.floor(Math.abs(delusion) * 0.5), 25) : -Math.max(Math.floor(Math.random() * Math.abs(delusion) * 0.1), 10);
                    delusion += reward;
                    showMessageModal('Memory Game Result', `You ${correct ? 'won' : 'lost'} and earned ${formatNumber(reward)} delusion!`);
                    updateDisplay(); // Update the display
                    startCooldown(gameType); // Start cooldown for the mini-game
                });
            }, timeout * 1000);
        });
    } else if (gameType === 'math') {
        // Math mini-game logic
        let num1 = Math.floor(Math.random() * 100) + 1;
        let num2 = Math.floor(Math.random() * 100) + 1;
        let num3 = Math.floor(Math.random() * 10) + 1;
        let operations = ['+', '-', '*', '/'];
        let op1 = operations[Math.floor(Math.random() * operations.length)];
        let op2 = operations[Math.floor(Math.random() * operations.length)];

        let question = `${num1} ${op1} ${num2} ${op2} ${num3}`;
        let correctAnswer = eval(question.replace('/', '* 1.0 /')); // Ensure floating point division

        showMessageModal('Math Game', `What is ${question}?  (answer within 0.5 is acceptable)`, false, false, true).then(answer => {
            let reward = Math.abs(Number(answer) - correctAnswer) < 0.5 ? Math.max(Math.floor(Math.abs(yachtMoney) * 0.25), 25) : -Math.max(Math.floor(Math.random() * Math.abs(yachtMoney) * 0.1), 10);
            yachtMoney += reward;
            showMessageModal('Math Game Result', `You guessed ${answer} and exact answer was ${correctAnswer}. You ${Math.abs(Number(answer) - correctAnswer) < 0.5 ? 'won' : 'lost'} and earned ${formatNumber(reward)} yachtMoney!`);
            updateDisplay(); // Update the display
            startCooldown(gameType); // Start cooldown for the mini-game
        });
    } else if (gameType === 'luck') {
        // Luck mini-game logic
        let result = (Math.random() * 200) - 75; // Generates a random number between -75 and +125%
        let message = "";
        let reward = Math.floor(trollPoints * (result / 100)); // Calculate reward based on the result percentage
        let gainLossMessage = reward >= 0 ? "gained" : "lost";
    
        if (result > 100) {
            message = "SUPER LUCKY!!! 🍀🍀🍀";
        } else if (result > 75) {
            message = "Very Lucky!!";
        } else if (result > 0) {
            message = "Lucky!";
        } else if (result > -40) {
            message = "Unlucky!";
        } else {
            message = "Extremely Unlucky 😞😞😞";
        }
    
        trollPoints += reward;
        showMessageModal('Luck Game Result', `You rolled ${result.toFixed(2)}%. ${message} You ${gainLossMessage} ${formatNumber(Math.abs(reward))} troll points!`);
        updateDisplay(); // Update the display
        startCooldown(gameType); // Start cooldown for the mini-game
    }
    
}

// Function to start the cooldown for a mini-game
function startCooldown(gameType) {
    const button = document.getElementById(`${gameType}Game`);
    const startTime = Date.now();
    localStorage.setItem(`${gameType}CooldownStart`, startTime);

    cooldowns[gameType] = true;
    if (button) {
        button.classList.remove('affordable');
        button.classList.add('disabled'); // Add a disabled class to change its appearance
        button.disabled = true;
    }

    setTimeout(() => {
        cooldowns[gameType] = false;
        if (button) {
            button.disabled = false;
            button.classList.remove('disabled');
            button.classList.add('affordable');
        }
    }, miniGameTimeouts[gameType]);
}

// Function to unlock mini-games based on cooldown status
function unlockMiniGames() {
    const now = Date.now();

    // Check each mini-game type
    Object.keys(miniGameTimeouts).forEach(gameType => {
        const startTime = localStorage.getItem(`${gameType}CooldownStart`);
        const button = document.getElementById(`${gameType}Game`);

        if (startTime) {
            const elapsed = now - parseInt(startTime, 10);
            if (elapsed >= miniGameTimeouts[gameType]) {
                // Cooldown has already passed
                if (button) {
                    cooldowns[gameType] = false;
                    button.disabled = false;
                    button.classList.remove('disabled');
                    button.classList.add('affordable');
                    button.style.display = 'block';
                }
            } else {
                // Start remaining cooldown
                const remainingCooldown = miniGameTimeouts[gameType] - elapsed;
                if (button) {
                    button.style.display = 'block';
                    button.disabled = true;
                    button.classList.add('disabled');
                    button.classList.remove('affordable');
                }
                setTimeout(() => {
                    if (button) {
                        cooldowns[gameType] = false;
                        button.disabled = false;
                        button.classList.remove('disabled');
                        button.classList.add('affordable');
                    }
                }, remainingCooldown);
            }
        } else {
            // No start time found, hide the button initially
            if (button) button.style.display = 'none';

            // Set timeout to show the button after the initial cooldown
            setTimeout(() => {
                if (button) {
                    button.style.display = 'block';
                    cooldowns[gameType] = false;
                    button.disabled = false;
                    button.classList.add('affordable');
                }
            }, miniGameTimeouts[gameType]);
        }
    });
}



async function restartGame(isPrestige = false, isAscend = false) {
    const confirmMessage = "Are you sure you want to restart the game? This will reset all your progress.";
    
    if (isPrestige || isAscend || await showMessageModal("Confirm Restart", confirmMessage, true, false)) {
         // Reset all resources and earnings per second
        copium = 0;
        copiumPerSecond = 0;
        delusion = 0;
        delusionPerSecond = 0;
        yachtMoney = 0;
        yachtMoneyPerSecond = 0;
        trollPoints = 0;
        trollPointsPerSecond = 0;
        hopium = 0;
        hopiumPerSecond = 0;

        // Reset prestiges and multipliers if it's not a prestige
        if (!isPrestige) {
            prestiges = 0;
            epsMultiplier = 1;
            prestigeRequirement = 1000;
        }

        // Reset ascends and multipliers if it's a full restart
        if (!isAscend && !isPrestige) {
            godModeLevel = 0;
            godModeMultiplier = 1;
            // Hide the cookie button
            document.getElementById('cookieButton').style.display = 'none';
            firstTimeCookieUnlock = true;
            // Reset the isGodMode property for all upgrades
            upgrades.forEach(upgrade => {
                upgrade.isGodMode = false;
            });
            // Clear all local storage
            localStorage.clear();
        }

        // Clear purchased upgrades
        purchasedUpgrades = [];
        document.getElementById('purchasedList').innerHTML = '';

        // Restore all upgrades
        availableUpgrades = upgrades.slice(); // Reset available upgrades to the original state

        // Save game state
        saveGameState();

        // Hide mini-game buttons initially
        document.getElementById('speedGame').style.display = 'none';
        document.getElementById('memoryGame').style.display = 'none';
        document.getElementById('mathGame').style.display = 'none';
        document.getElementById('luckGame').style.display = 'none';

        // Start unlock timeouts for mini-games
        unlockMiniGames();

        // Update display
        updateEffectiveMultipliers();
        updateDisplay();
        updateUpgradeList();
    }
}


// Function to update the displayed trade ratio based on selected resources
function updateTradeRatio() {
    const fromResource = document.getElementById('fromResource').value;
    const toResource = document.getElementById('toResource').value;
    const tradeRatioDisplay = document.getElementById('tradeRatioDisplay');

    // Special case for trading Copium to Hopium
    if (fromResource === 'copium' && toResource === 'hopium') {
        tradeRatioDisplay.textContent = 'Trade ratio is 100M:1';
    } else if (toResource === 'hopium') {
        tradeRatioDisplay.textContent = 'Only Copium can convert to Hopium';
    } else {
        tradeRatioDisplay.textContent = 'Trade ratio is 5:1';
    }
}

function parseFormattedNumber(str) {
    const suffixes = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, P: 1e15, E: 1e18 };
    const regex = /^(\d+(\.\d+)?)([KMBTPE]?)$/i;
    const match = str.match(regex);
    if (match) {
        const [, num, , suffix] = match;
        return parseFloat(num) * (suffixes[suffix.toUpperCase()] || 1);
    }
    return NaN;
}


// Function to handle trading resources between different types
function tradeResources() {
    const fromResource = document.getElementById('fromResource').value;
    const toResource = document.getElementById('toResource').value;
    const tradeAmountInput = document.getElementById('tradeAmount').value;
    const tradeAmount = parseFormattedNumber(tradeAmountInput);

    // Check if the same resource is selected for both from and to
    if (fromResource === toResource) {
        showMessageModal('Trade Error', "Cannot trade the same resource.");
        return;
    }

    // Check if trade amount is valid
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
        showMessageModal('Trade Error', 'Please enter a valid trade amount.');
        return;
    }

    // Object to store current amounts of each resource
    const resourceAmount = {
        copium: copium,
        delusion: delusion,
        yachtMoney: yachtMoney,
        trollPoints: trollPoints,
        hopium: hopium
    };

    // Special trade case for converting Copium to Hopium
    if (fromResource === 'copium' && toResource === 'hopium') {
        if (resourceAmount[fromResource] < tradeAmount) {
            showMessageModal('Trade Error', `Not enough ${fromResource} to trade.`);
            return;
        }
        resourceAmount[fromResource] -= tradeAmount;
        resourceAmount[toResource] += tradeAmount / 100000000;
        
        // Show trade success message
        showMessageModal('Trade Successful', `Traded ${formatNumber(tradeAmount)} ${fromResource} for ${formatNumber(tradeAmount / 100000000)} ${toResource}.`);
    } else if (toResource === 'hopium') {
        showMessageModal('Trade Error', "Only Copium can convert to Hopium.");
        return;
    } else {
        // General trade case for other resources
        if (resourceAmount[fromResource] < tradeAmount) {
            showMessageModal('Trade Error', `Not enough ${fromResource} to trade.`);
            return;
        }
        resourceAmount[fromResource] -= tradeAmount;
        resourceAmount[toResource] += tradeAmount / 5;
        
        // Show trade success message
        showMessageModal('Trade Successful', `Traded ${formatNumber(tradeAmount)} ${fromResource} for ${formatNumber(tradeAmount / 5)} ${toResource}.`);
    }

    // Update global resource variables
    copium = resourceAmount.copium;
    delusion = resourceAmount.delusion;
    yachtMoney = resourceAmount.yachtMoney;
    trollPoints = resourceAmount.trollPoints;
    hopium = resourceAmount.hopium;

    // Update the display to reflect the new resource values
    updateDisplay();

}

function customRound(number, digits) {
    // Convert the number to a string
    let numStr = number.toString();
    // Find the position of the decimal point
    let decimalIndex = numStr.indexOf('.');
    
    // If there is no decimal point or the number of digits is already less than or equal to the specified digits
    if (decimalIndex === -1 || numStr.length - decimalIndex - 1 <= digits) {
        return numStr; // Return the original number as a string
    }
    
    // If the number has more digits than the specified digits, round it
    return number.toFixed(digits);
}

function formatNumber(num) {
    const suffixes = [
        { value: 1e18, symbol: "E" }, // Exa
        { value: 1e15, symbol: "P" }, // Peta
        { value: 1e12, symbol: "T" }, // Tera
        { value: 1e9, symbol: "B" },  // Giga (Billion)
        { value: 1e6, symbol: "M" },  // Mega (Million)
        { value: 1e3, symbol: "K" }   // Kilo (Thousand)
    ];
    for (let i = 0; i < suffixes.length; i++) {
        if (Math.abs(num) >= suffixes[i].value) {
            return customRound(num / suffixes[i].value, 3) + suffixes[i].symbol;
        }
    }
    return customRound(num, 3);
}


// Function to update the display with the current game state
function updateDisplay() {
    document.getElementById('copium').textContent = formatNumber(copium);
    document.getElementById('cps').textContent = formatNumber(effectiveCopiumPerSecond);
    document.getElementById('delusion').textContent = formatNumber(delusion);
    document.getElementById('dps').textContent = formatNumber(effectiveDelusionPerSecond);
    document.getElementById('yachtMoney').textContent = formatNumber(yachtMoney);
    document.getElementById('ymps').textContent = formatNumber(effectiveYachtMoneyPerSecond);
    document.getElementById('trollPoints').textContent = formatNumber(trollPoints);
    document.getElementById('tpps').textContent = formatNumber(effectiveTrollPointsPerSecond);
    document.getElementById('hopium').textContent = formatNumber(hopium);
    document.getElementById('hps').textContent = formatNumber(effectiveHopiumPerSecond);
    document.getElementById('prestige-multiplier').textContent = `Prestige: x${epsMultiplier.toFixed(2)} mult`;

    // Update combined God Mode Level and Multiplier display
    document.getElementById('god-mode-display').textContent = `God-Mode Level ${godModeLevel} (x${godModeMultiplier.toFixed(2)} mult)`;

    updatePrestigeButton();
    updateAscendButton();
    updateUpgradeButtons();
}




// Function to calculate the prestige multiplier based on the lowest of the first four resources
function calculatePrestigeMultiplier() {
    const minResource = Math.min(copium, delusion, yachtMoney, trollPoints);
    return 1.5 ** (Math.log10(minResource / 1000) + 1);
}

// Check if the player can prestige
function canPrestige() {
    const minResource = Math.min(copium, delusion, yachtMoney, trollPoints);
    return minResource >= prestigeRequirement;
}

async function prestige() {
    if (canPrestige()) {

        const confirmed = await showMessageModal(
            'Prestige Confirmation',
            `Are you sure you want to prestige? You will reset your progress and all resources, but your Prestige Multiplier will increase <strong>from ${formatNumber(epsMultiplier)} to ${formatNumber(calculatePrestigeMultiplier())}</strong>.<br>(Prestige multiplier is based on the lowest among your first four resources (Copium, Delusion, Yacht Money, and Troll Points). The higher the amount of your smallest resource, the greater your prestige multiplier!)`,
            true
        );

        if (confirmed) {
            epsMultiplier = calculatePrestigeMultiplier();
            prestigeRequirement = Math.min(copium, delusion, yachtMoney, trollPoints);
            
            // Call restartGame with isPrestige flag set to true
            restartGame(true,false);

            prestiges += 1;

            // Save game state after prestige
            saveGameState();

            showMessageModal('Prestige Successful!', `Your multiplier is now x${epsMultiplier.toFixed(2)}. All resources have been reset.`);
            updateEffectiveMultipliers();
            updateDisplay();
        }
    }
}

// Update the display of the prestige button
function updatePrestigeButton() {
    
    const prestigeButton = document.getElementById('prestigeButton');
    if (canPrestige()) {
        if (firstTimePrestigeButtonAvailable) {
            showMessageModal('Prestige Unlocked: Rise Stronger!', 'Congratulations, mighty player! You have unlocked the legendary path of Prestige. This powerful option allows you to reset your game progress, but with a game-changing twist: you gain a new multiplier that enhances everything you do.<br><br>Prestige represents more than just a reset. It symbolizes the resilience of the human spirit, the relentless pursuit of growth, and the ability to rise stronger after every fall. Just as life sometimes knocks you down, this journey will set you back temporarily. But with each Prestige, you come back more powerful, your abilities amplified, and your potential limitless.<br><br>Embrace the opportunity to start anew with greater strength. Every click, every resource gathered, and every upgrade purchased will now be boosted by your newfound multiplier. It\'s a fresh start, a chance to overcome challenges with enhanced vigor and wisdom.<br><br>Are you ready to embark on this transformative journey? To not only rebuild but to surpass your previous achievements? Prestige now, and let your ascent to greatness begin anew!');
            firstTimePrestigeButtonAvailable = false; // Set the flag to false after showing the message
            saveGameState(); // Save the game state to persist the flag
        }
        const newMultiplier = calculatePrestigeMultiplier();
        prestigeButton.textContent = `Prestige (x${(newMultiplier / epsMultiplier).toFixed(2)} multiplier)`;
        prestigeButton.style.display = 'block';
    } else {
        prestigeButton.style.display = 'none';
    }
}

function canAscend() {
    return purchasedUpgrades.some(upgrade => upgrade.name === "Ascension");
}

async function ascend() {

    const selectedUpgrade = await showMessageModal(
        'God-Mode Ascension',
        `Are you sure you want to enter God-Mode level ${godModeLevel + 1}? You will lose all your Upgrades and Prestige progress!<br><br><strong>Select one of your purchased upgrades to enhance (10x multiplier).</strong><br>Tip: You will want to drive up your God-Mode level quickly. However, while you can ascend to as many God-Mode levels as you desire, it's not necessary to achieve every level to proceed to the next chapter.`,
        true,
        true
    );

    if (selectedUpgrade) {

        godModeLevel += 1;
        godModeMultiplier = 1.2 ** godModeLevel;

        showMessageModal('Ascension Successful!', `You have entered God-Mode Level ${godModeLevel}. Your multiplier is now x${formatNumber(godModeMultiplier)} and your chosen upgrade (${selectedUpgrade.name}) is 10x stronger.`);        
        selectedUpgrade.isGodMode = true;
        
        restartGame(false,true); // Use the existing restartGame function with prestige mode
        // Save game state after ascending
        saveGameState();
        updateEffectiveMultipliers();
        updateDisplay();
    }
}

function updateAscendButton() {
    const ascendButton = document.getElementById('ascendButton');
    if (canAscend()) {
        ascendButton.style.display = 'block';
    } else {
        ascendButton.style.display = 'none';
    }
}


// Function to generate idle resources based on the elapsed time
function generateIdleResources(elapsedSeconds) {
    // Increase resources based on their per second values, elapsed time, and the multiplier
    copium += copiumPerSecond * epsMultiplier * godModeMultiplier * elapsedSeconds;
    delusion += delusionPerSecond * epsMultiplier * godModeMultiplier * elapsedSeconds;
    yachtMoney += yachtMoneyPerSecond * epsMultiplier * godModeMultiplier * elapsedSeconds;
    trollPoints += trollPointsPerSecond * epsMultiplier * godModeMultiplier * elapsedSeconds;
    hopium += hopiumPerSecond * epsMultiplier * godModeMultiplier * elapsedSeconds;
}

// Function to encode a name for safe usage in URLs or storage
function encodeName(name) {
    return encodeURIComponent(name);
}

// Function to decode an encoded name back to its original form
function decodeName(encodedName) {
    return decodeURIComponent(encodedName);
}

// Function to handle the purchase of an upgrade
function buyUpgrade(encodedUpgradeName) {
    // Decode the upgrade name
    const upgradeName = decodeName(encodedUpgradeName);
    // Find the upgrade object by its name in the available upgrades list
    const upgrade = availableUpgrades.find(up => up.name === upgradeName);
    
    // If the upgrade is not found, log an error and return
    if (!upgrade) {
        console.error(`Upgrade not found: ${upgradeName}`);
        return;
    }

    // Destructure the upgrade object to get its properties
    const { cost, earnings, img, name, message, miniPrestigeMultiplier } = upgrade;

    // Check if the player has enough resources to purchase the upgrade
    if ((cost.copium === 0 || copium >= cost.copium) &&
        (cost.delusion === 0 || delusion >= cost.delusion) &&
        (cost.yachtMoney === 0 || yachtMoney >= cost.yachtMoney) &&
        (cost.trollPoints === 0 || trollPoints >= cost.trollPoints) &&
        (cost.hopium === 0 || hopium >= cost.hopium)) {

        // Deduct the cost from the player's resources
        copium -= cost.copium;
        delusion -= cost.delusion;
        yachtMoney -= cost.yachtMoney;
        trollPoints -= cost.trollPoints;
        hopium -= cost.hopium;

        // Increase the per second earnings for each resource, apply God Mode multiplier if applicable
        const multiplier = upgrade.isGodMode ? 10 : 1;
        copiumPerSecond += (earnings.copiumPerSecond || 0) * multiplier;
        delusionPerSecond += (earnings.delusionPerSecond || 0) * multiplier;
        yachtMoneyPerSecond += (earnings.yachtMoneyPerSecond || 0) * multiplier;
        trollPointsPerSecond += (earnings.trollPointsPerSecond || 0) * multiplier;
        hopiumPerSecond += (earnings.hopiumPerSecond || 0) * multiplier;

        // Add the purchased upgrade to the display
        addPurchasedUpgrade(img, name, earnings, upgrade.isGodMode);
        // Remove the upgrade from the available upgrades list
        availableUpgrades.splice(availableUpgrades.indexOf(upgrade), 1);
        // Add the upgrade to the purchased upgrades list
        purchasedUpgrades.push(upgrade);

        // Special case for unlocking the "Cookie Clicker" upgrade
        if (name === "Cookie Clicker" && firstTimeCookieUnlock) {
            document.getElementById('cookieButton').style.display = 'block';
            showMessageModal('Cookie Clicker', "In the vast world of idle games, one title stands as the beacon that lit the path for all others: Cookie Clicker. Launched in 2013, Cookie Clicker captivated millions with its simple yet endlessly engaging premise. The thrill of watching numbers grow, the joy of achieving milestones, and the addictiveness of endless clicking and upgrading—all these elements combined to create a phenomenon that transcended the gaming community.\n\nIn homage to this legendary game, you have now unlocked a cookie! Clicking this cookie will count as clicking each collect button 10 times! It will persist across Prestiges! Happy clicking!");
            firstTimeCookieUnlock = false;
        } else if (name === "Cookie Clicker") {
            document.getElementById('cookieButton').style.display = 'block';
        }

        // Special case for unlocking the "Ascension" upgrade
        if (name === "Ascension" && godModeLevel < 1) {
            showMessageModal('Ascension', "Congratulations, brave soul! With the purchase of the Ascension upgrade, you have unlocked the extraordinary ability to Ascend Above Mortals and enter the revered God Mode. Prepare yourself for an epic journey where the limits of mortality no longer bind you.\n\nWelcome to the next chapter of your legendary adventure. Ascend and let your godlike journey begin!");
        } 

        // Show a message if the upgrade has one
        if (message) {
            showMessageModal(name, message);
        }

        // Special case for the "Antimatter Dimension" upgrade
        if (name === "Antimatter Dimensions") {
            showMessageModal('Sadly', "This is around the end of v0.63. You can now restart the game and do some speed runs, or start to strategize how to lower delusion to tackle the next chapter of your existential tale. At this pace should have another big update within a couple days.");
        }

        // Apply a mini prestige multiplier if the upgrade has one
        if (miniPrestigeMultiplier) {
            epsMultiplier *= miniPrestigeMultiplier;
            showMessageModal('Multiplier Changed', `Prestige multiplier changed to x${epsMultiplier.toFixed(2)}`);
        }

        // Update the upgrade list and display
        updateUpgradeList();
        updateEffectiveMultipliers();
        updateDisplay();
        // Save the game state
        saveGameState();

    } else {
        // Show an alert if the player does not have enough resources
        showMessageModal('Purchase Denied', 'Not enough resources to purchase this upgrade.');
    }
    // Update the upgrade buttons to reflect the current state
    updateUpgradeButtons();
}







// Function to format the cost or earnings of an upgrade for display
function formatCostOrEarnings(costOrEarnings, isGodMode = false) {
    // Abbreviations for resource per second values
    const abbreviations = {
        copiumPerSecond: '<b>C</b>PS',
        delusionPerSecond: '<b>D</b>PS',
        yachtMoneyPerSecond: '<b>YM</b>PS',
        trollPointsPerSecond: '<b>TP</b>PS',
        hopiumPerSecond: '<b>H</b>PS'
    };

    let result = '';
    // Iterate over each resource and its value in the costOrEarnings object
    for (const [resource, value] of Object.entries(costOrEarnings)) {
        // Only include non-zero values
        if (value !== 0) {
            // Get the display name using abbreviations or capitalize the resource name
            const displayName = abbreviations[resource] || resource.charAt(0).toUpperCase() + resource.slice(1);
            const adjustedValue = isGodMode ? value * 10 : value;
            result += `<p>${displayName}: ${formatNumber(adjustedValue)}</p>`; // Format as HTML paragraph
        }
    }
    return result;
}


// Function to add a purchased upgrade to the display
function addPurchasedUpgrade(img, name, earnings, isGodMode = false) {
    const purchasedList = document.getElementById('purchasedList'); // Get the purchased list container
    const upgradeElement = document.createElement('div'); // Create a new div element
    upgradeElement.classList.add('purchased-upgrade'); // Add the 'purchased-upgrade' class

    // Add the God Mode class if applicable
    if (isGodMode) {
        upgradeElement.classList.add('purchased-upgrade-godmode');
    }

    // Set the inner HTML of the new div element
    upgradeElement.innerHTML = `
        <img src="${img}" alt="${name}"> <!-- Upgrade image -->
        <div>
            <p>${name}</p> <!-- Upgrade name -->
            <div class="upgrade-earnings">
                ${formatCostOrEarnings(earnings, isGodMode)} <!-- Formatted earnings -->
            </div>
        </div>
    `;
    purchasedList.prepend(upgradeElement); // Prepend to show the most recent first
}


// Function to get the total cost of an upgrade
function getTotalCost(upgrade) {
    // Sum up the costs of all resources in the upgrade
    return (upgrade.cost.copium || 0) + 
           (upgrade.cost.delusion || 0) + 
           (upgrade.cost.yachtMoney || 0) + 
           (upgrade.cost.trollPoints || 0) + 
           (upgrade.cost.hopium * 100000000 || 0);
}


// Function to update the upgrade list display
function updateUpgradeList() {
    const upgradeList = document.getElementById('upgradeList');
    upgradeList.innerHTML = ''; // Clear the current upgrade list

    // Sort available upgrades by their total cost
    const sortedUpgrades = availableUpgrades.slice().sort((a, b) => getTotalCost(a) - getTotalCost(b));

    // Limit the display to the top 7 upgrades
    const topUpgrades = sortedUpgrades.slice(0, 7);

    // Create and append upgrade elements to the upgrade list
    topUpgrades.forEach(upgrade => {
        const encodedName = encodeName(upgrade.name);
        const upgradeElement = document.createElement('div');
        upgradeElement.classList.add('upgrade');
        upgradeElement.innerHTML = `
            <button data-upgrade-name="${encodedName}">${upgrade.name}</button>
            <div class="upgrade-cost">
                ${formatCostOrEarnings(upgrade.cost)}
            </div>
        `;
        upgradeList.appendChild(upgradeElement); // Append the upgrade element to the list
    });

    // Attach event listeners to the new upgrade buttons
    document.querySelectorAll('[data-upgrade-name]').forEach(button => {
        button.addEventListener('click', () => {
            const encodedName = button.getAttribute('data-upgrade-name');
            buyUpgrade(encodedName); // Handle the upgrade purchase
        });
    });

    // Update the upgrade buttons to highlight affordable ones
    updateUpgradeButtons();
}

// Function to update the appearance of upgrade buttons based on affordability
function updateUpgradeButtons() {
    upgrades.forEach(upgrade => {
        const encodedName = encodeName(upgrade.name);
        const button = document.querySelector(`button[data-upgrade-name="${encodedName}"]`);
        if (button) {
            const { cost } = upgrade;
            // Check if the upgrade is affordable based on current resources
            const affordable = (cost.copium === 0 || copium >= cost.copium) &&
                               (cost.delusion === 0 || delusion >= cost.delusion) &&
                               (cost.yachtMoney === 0 || yachtMoney >= cost.yachtMoney) &&
                               (cost.trollPoints === 0 || trollPoints >= cost.trollPoints) &&
                               (cost.hopium === 0 || hopium >= cost.hopium);

            // Add or remove the appropriate class based on affordability and God Mode status
            if (affordable) {
                if (upgrade.isGodMode) {
                    button.classList.add('affordable-godmode');
                    button.classList.remove('affordable');
                } else {
                    button.classList.add('affordable');
                    button.classList.remove('affordable-godmode');
                }
            } else {
                button.classList.remove('affordable', 'affordable-godmode');
            }
        }
    });
}

// Variable to track the state of developer mode
let developerMode = false;

// Function to toggle developer mode on and off
function toggleDeveloperMode() {
    developerMode = !developerMode; // Toggle the developer mode state
    if (developerMode) {
        // Increase resource generation rates by 1000x in developer mode
        copiumPerSecond *= 1000;
        delusionPerSecond *= 1000;
        yachtMoneyPerSecond *= 1000;
        trollPointsPerSecond *= 1000;
        showMessageModal('Dev Mode', "Developer Mode Activated: Resource generation is now 1000x faster!");
    } else {
        // Reset resource generation rates to normal
        copiumPerSecond /= 1000;
        delusionPerSecond /= 1000;
        yachtMoneyPerSecond /= 1000;
        trollPointsPerSecond /= 1000;
        showMessageModal('Dev Mode', "Developer Mode Deactivated: Resource generation is back to normal.");
    }
    updateEffectiveMultipliers();
    updateDisplay(); // Update the display to reflect the changes
}


// Add event listener for the key combination
document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key === 'D') {
        toggleDeveloperMode();
    }
});

function showMessageModal(title, message, isConfirm = false, isUpgradeSelection = false) {
    return new Promise((resolve, reject) => {
        modalQueue.push({ title, message, isConfirm, isUpgradeSelection, resolve, reject });
        if (!isModalOpen) {
            displayNextModal();
        }
    });
}

function displayNextModal() {
    if (modalQueue.length === 0) {
        isModalOpen = false;
        return;
    }

    isModalOpen = true;
    const modal = document.getElementById('messageModal');
    const closeButton = document.getElementById('closeMessageModal');
    const modalCloseButton = document.getElementById('modalCloseButton');
    const modalConfirmButtons = document.getElementById('modalConfirmButtons');
    const modalConfirmButton = document.getElementById('modalConfirmButton');
    const modalCancelButton = document.getElementById('modalCancelButton');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const ascendUpgradeSelection = document.getElementById('ascendUpgradeSelection');
    const ascendUpgradeList = document.getElementById('ascendUpgradeList');
    const gameInputSection = document.getElementById('gameInputSection');
    const gameInput = document.getElementById('gameInput');
    const submitGameInputButton = document.getElementById('submitGameInputButton');

    const { title, message, isConfirm, isUpgradeSelection, resolve } = modalQueue.shift();

    modalTitle.textContent = title || '';
    modalMessage.innerHTML = message || '';
    modal.style.display = 'block';

    const closeModal = (result) => {
        modal.style.display = 'none';
        displayNextModal();
        resolve(result);
    };

    if (isConfirm && isUpgradeSelection) {
        // Ascend with upgrade selection logic
        modalCloseButton.style.display = 'none';
        modalConfirmButtons.style.display = 'flex';
        ascendUpgradeSelection.style.display = 'block';
        ascendUpgradeList.innerHTML = '';

        let selectedUpgrade = null;

        purchasedUpgrades.forEach((upgrade, index) => {
            if (!upgrade.isGodMode) {
                const upgradeItem = document.createElement('div');
                upgradeItem.className = 'ascend-upgrade-item';
                upgradeItem.textContent = upgrade.name;
                upgradeItem.onclick = () => {
                    const selected = ascendUpgradeList.querySelector('.selected');
                    if (selected) selected.classList.remove('selected');
                    upgradeItem.classList.add('selected');
                    selectedUpgrade = upgrade;
                };
                ascendUpgradeList.appendChild(upgradeItem);
            }
        });

        modalConfirmButton.onclick = () => {
            if (selectedUpgrade) {
                closeModal(selectedUpgrade);
            }
        };

        modalCancelButton.onclick = () => closeModal(null);

        closeButton.onclick = () => closeModal(null);
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal(null);
            }
        };
    } else if (isConfirm) {
        // Confirm modal logic
        modalCloseButton.style.display = 'none';
        modalConfirmButtons.style.display = 'flex';
        ascendUpgradeSelection.style.display = 'none';
        gameInputSection.style.display = 'none';

        modalConfirmButton.onclick = () => closeModal(true);
        modalCancelButton.onclick = () => closeModal(false);

        closeButton.onclick = () => closeModal(false);
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal(false);
            }
        };
    } else if (message.includes('Enter the sequence:') || message.includes('What is ')) {
        // Game input modal logic
        modalCloseButton.style.display = 'none';
        modalConfirmButtons.style.display = 'none';
        ascendUpgradeSelection.style.display = 'none';
        gameInputSection.style.display = 'block';

        gameInput.value = '';
        submitGameInputButton.onclick = () => closeModal(gameInput.value);

        closeButton.onclick = () => closeModal(null);
        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal(null);
            }
        };
    } else {
        // Simple message modal logic
        modalCloseButton.style.display = 'block';
        modalConfirmButtons.style.display = 'none';
        ascendUpgradeSelection.style.display = 'none';
        gameInputSection.style.display = 'none';

        modalCloseButton.onclick = () => closeModal();
        closeButton.onclick = () => closeModal();

        window.onclick = (event) => {
            if (event.target == modal) {
                closeModal();
            }
        };
    }
}





// Function to show the welcome modal
function showWelcomeModal() {
    return showMessageModal(
        'Welcome to Degens Idle',
        `
        <p>Step into a world where the dankest memes meet the depths of introspective contemplation. In Degens Idle, you’re not just collecting resources—you’re diving headfirst into a journey of existential discovery.</p>
        <p>Embrace the grind as you gather Copium, Delusion, Yacht Money, Troll Points, and the elusive Hopium. Each click and upgrade is a step closer to understanding the universe of internet culture and your place within it.</p>
        <p>Are you ready to transcend the ordinary? To not only witness but harness the power of memes in their truest, most profound form? Every action you take will push you to ponder life’s greatest mysteries and your role in this meme-laden multiverse.</p>
        <h2>How to Play:</h2>
        <ul>
            <li><strong>Click to Gather Resources:</strong> Start by clicking to collect Copium and other essential resources. Each click brings you closer to unlocking new memes and upgrades.</li>
            <li><strong>Upgrade Your Abilities:</strong> Use your resources to purchase upgrades. These will enhance your clicking power and resource generation, allowing you to progress faster.</li>
            <li><strong>Unlock New Content:</strong> Venture into the unknown and unveil hidden secrets of the meme-iverse. Each resource collected and upgrade acquired opens portals to mysterious realms, revealing cryptic memes and arcane powers that will enhance your journey.</li>
            <li><strong>Explore the Meme-iverse:</strong> Dive into various aspects of internet culture. Each upgrade and unlocked meme will reveal more about the meme-iverse and your place within it.</li>
            <li><strong>Ponder and Reflect:</strong> As you progress, take a moment to ponder the deeper meanings behind the memes. What do they say about life, existence, and your role in this digital realm?</li>
        </ul>
        `
    );
}


// Show the welcome modal when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    showWelcomeModal();
    // Other existing event listeners and initializations
});



// Expose functions to the global scope for use in the HTML
window.prestige = prestige;
window.updateDisplay = updateDisplay;
window.updateUpgradeButtons = updateUpgradeButtons;
window.updateUpgradeList = updateUpgradeList;
window.collectResource = collectResource;
window.generateResources = generateResources;
window.buyUpgrade = buyUpgrade;

// Add event listeners after the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener for the cookie button to collect all resources
    document.getElementById('cookieButton').addEventListener('click', collectAllResources);

    // Add event listeners for resource collection buttons
    document.getElementById('collectCopiumButton').addEventListener('click', () => { collectResource('copium'); });
    document.getElementById('collectDelusionButton').addEventListener('click', () => { collectResource('delusion'); });
    document.getElementById('collectYachtMoneyButton').addEventListener('click', () => { collectResource('yachtMoney'); });
    document.getElementById('collectTrollPointsButton').addEventListener('click', () => { collectResource('trollPoints'); });

    // Add event listeners for mini-game buttons
    document.getElementById('speedGame').addEventListener('click', () => { playMiniGame('speed'); });
    document.getElementById('memoryGame').addEventListener('click', () => { playMiniGame('memory'); });
    document.getElementById('mathGame').addEventListener('click', () => { playMiniGame('math'); });
    document.getElementById('luckGame').addEventListener('click', () => { playMiniGame('luck'); });

    // Add event listener for the trade button
    document.getElementById('tradeButton').addEventListener('click', () => { tradeResources(); });
    // Add event listener for the restart button
    document.getElementById('restartButton').addEventListener('click', () => restartGame(false, false));


    // Add event listener for the prestige button
    document.getElementById('prestigeButton').addEventListener('click', prestige);

    // Add event listener for the ascend button
    document.getElementById('ascendButton').addEventListener('click', ascend);

    // Load the game state from local storage
    loadGameState();
    // Initialize effective multipliers
    updateEffectiveMultipliers();
    // Unlock mini-games based on the current game state
    unlockMiniGames(); 
    // Set an interval to generate resources every second
    setInterval(generateResources, 1000);
    // Update the display with the current game state
    updateDisplay();
    // Update the list of available upgrades
    updateUpgradeList();
    // Save the game state when the window is about to be unloaded
    window.addEventListener('beforeunload', saveGameState);
});
