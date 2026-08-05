/**
 * exchange.js - RobEX Exchange Engine
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
    const user = await window.getAuthenticatedUser();
    
    if (!user) {
        alert("You must be logged in to trade currency.");
        window.location.href = "login.html";
        return;
    }

    const userId = user.id;
    const giveAmount = parseInt(document.getElementById("tradeGiveAmount")?.value) || 0;
    const giveCurrency = document.getElementById("giveCurrency")?.value;

    if (giveAmount <= 0) {
        alert("Enter a valid amount to trade.");
        return;
    }

    try {
        const { data: profile, error } = await _supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (error) throw error;

        if (giveCurrency === "tix") {
            if (giveAmount % TIX_EXCHANGE_RATE !== 0) {
                alert(`Tix must be traded in multiples of ${TIX_EXCHANGE_RATE}.`);
                return;
            }
            if (profile.tickets < giveAmount) {
                alert("You do not have enough Tickets.");
                return;
            }

            const robuxGained = giveAmount / TIX_EXCHANGE_RATE;
            const newTix = profile.tickets - giveAmount;
            const newRobux = profile.robux + robuxGained;

            const { error: updateError } = await _supabase
                .from("profiles")
                .update({ tickets: newTix, robux: newRobux })
                .eq("id", userId);

            if (updateError) throw updateError;

            alert(`Trade Successful! Traded ${giveAmount} Tix for ${robuxGained} R$.`);
        } else {
            if (profile.robux < giveAmount) {
                alert("You do not have enough Robux.");
                return;
            }

            const tixGained = giveAmount * TIX_EXCHANGE_RATE;
            const newRobux = profile.robux - giveAmount;
            const newTix = profile.tickets + tixGained;

            const { error: updateError } = await _supabase
                .from("profiles")
                .update({ tickets: newTix, robux: newRobux })
                .eq("id", userId);

            if (updateError) throw updateError;

            alert(`Trade Successful! Traded ${giveAmount} R$ for ${tixGained} Tix.`);
        }

        calculateTradePreview();

    } catch (err) {
        console.error("Trade Error:", err);
        alert("Trade failed: " + err.message);
    }
}
