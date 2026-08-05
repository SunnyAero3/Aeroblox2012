/**
 * js/exchange.js - RobEX Currency Exchange System
 */

const TIX_EXCHANGE_RATE = 10; // 10 Tix = 1 Robux

document.addEventListener("DOMContentLoaded", () => {
    initExchange();
});

function initExchange() {
    const giveInput = document.getElementById("tradeGiveAmount");
    const currencySelect = document.getElementById("giveCurrency");
    const submitBtn = document.getElementById("btnSubmitTrade");

    if (giveInput) giveInput.addEventListener("input", calculateTradePreview);
    if (currencySelect) currencySelect.addEventListener("change", calculateTradePreview);
    if (submitBtn) submitBtn.addEventListener("click", processTrade);

    calculateTradePreview();
}

function calculateTradePreview() {
    const giveAmount = parseFloat(document.getElementById("tradeGiveAmount")?.value) || 0;
    const giveCurrency = document.getElementById("giveCurrency")?.value;
    const getAmountInput = document.getElementById("tradeGetAmount");
    const getLabel = document.getElementById("getCurrencyLabel");

    if (!getAmountInput || !getLabel) return;

    if (giveCurrency === "tix") {
        getLabel.innerText = "Robux";
        getLabel.style.color = "#008000";
        getAmountInput.value = Math.floor(giveAmount / TIX_EXCHANGE_RATE);
    } else {
        getLabel.innerText = "Tickets";
        getLabel.style.color = "#cc6600";
        getAmountInput.value = Math.floor(giveAmount * TIX_EXCHANGE_RATE);
    }
}

async function processTrade() {
    const loggedInUser = localStorage.getItem("aeroUser");
    
    if (!loggedInUser) {
        alert("You must be logged in to trade currency.");
        window.location.href = "login.html";
        return;
    }

    const giveAmount = parseInt(document.getElementById("tradeGiveAmount")?.value) || 0;
    const giveCurrency = document.getElementById("giveCurrency")?.value;

    if (giveAmount <= 0) {
        alert("Enter a valid amount to trade.");
        return;
    }

    try {
        // Fetch current user balances from 'users' table
        const { data: user, error } = await _supabase
            .from('users')
            .select('robux, tickets')
            .eq('username', loggedInUser)
            .maybeSingle();

        if (error || !user) throw new Error("Could not fetch user data.");

        const currentTix = user.tickets ?? 0;
        const currentRobux = user.robux ?? 0;

        if (giveCurrency === "tix") {
            if (giveAmount % TIX_EXCHANGE_RATE !== 0) {
                alert(`Tix must be traded in multiples of ${TIX_EXCHANGE_RATE}.`);
                return;
            }
            if (currentTix < giveAmount) {
                alert("You do not have enough Tickets.");
                return;
            }

            const robuxGained = giveAmount / TIX_EXCHANGE_RATE;
            const newTix = currentTix - giveAmount;
            const newRobux = currentRobux + robuxGained;

            const { error: updateError } = await _supabase
                .from('users')
                .update({ tickets: newTix, robux: newRobux })
                .eq('username', loggedInUser);

            if (updateError) throw updateError;

            alert(`Trade Successful! Traded ${giveAmount} Tix for ${robuxGained} R$.`);
        } else {
            if (currentRobux < giveAmount) {
                alert("You do not have enough Robux.");
                return;
            }

            const tixGained = giveAmount * TIX_EXCHANGE_RATE;
            const newRobux = currentRobux - giveAmount;
            const newTix = currentTix + tixGained;

            const { error: updateError } = await _supabase
                .from('users')
                .update({ tickets: newTix, robux: newRobux })
                .eq('username', loggedInUser);

            if (updateError) throw updateError;

            alert(`Trade Successful! Traded ${giveAmount} R$ for ${tixGained} Tix.`);
        }

        // Refresh topbar and page metrics
        if (typeof checkAuth === "function") checkAuth();
        calculateTradePreview();

    } catch (err) {
        console.error("Trade Error:", err);
        alert("Trade failed: " + err.message);
    }
}
