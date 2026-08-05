/**
 * js/manage.js - aeroblox2012 Main Site Management Controls
 */

// Generates the 3-dots context menu HTML for item cards
function renderIndexContextMenu(assetId, currentDesc, priceRobux, priceTickets, isOwner) {
    if (!isOwner) return '';

    const safeDesc = encodeURIComponent(currentDesc || '');
    return `
        <div class="context-menu-container" style="position: absolute; top: 6px; right: 6px; z-index: 50;">
            <button type="button" class="three-dots-btn" onclick="toggleContextMenu(event, ${assetId})" style="background: rgba(255,255,255,0.9); border: 1px solid #999; border-radius: 3px; cursor: pointer; padding: 2px 6px; font-weight: bold; font-size: 12px;">&#8942;</button>
            <div id="context-menu-${assetId}" class="context-menu-dropdown" style="display: none; position: absolute; right: 0; top: 22px; background: #ffffff; border: 1px solid #7a7a7a; box-shadow: 2px 2px 6px rgba(0,0,0,0.3); min-width: 140px; border-radius: 2px;">
                <button onclick="editAssetDetails(${assetId}, '${safeDesc}', ${priceRobux}, ${priceTickets})" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:11px; color:#333;">Edit Details & Pricing</button>
                <button onclick="deleteAsset(${assetId})" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:11px; color:#cc0000;">Delete Asset</button>
            </div>
        </div>
    `;
}

function toggleContextMenu(event, assetId) {
    event.stopPropagation();
    document.querySelectorAll('.context-menu-dropdown').forEach(el => {
        if (el.id !== `context-menu-${assetId}`) el.style.display = 'none';
    });
    const target = document.getElementById(`context-menu-${assetId}`);
    if (target) {
        target.style.display = (target.style.display === 'block') ? 'none' : 'block';
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.context-menu-dropdown').forEach(el => el.style.display = 'none');
});

async function editAssetDetails(assetId, encodedDesc, robux, tickets) {
    const desc = decodeURIComponent(encodedDesc);
    const newDesc = prompt("Update Asset Description:", desc);
    if (newDesc === null) return;

    const newRobux = prompt("Set Price in Robux (0 for Free):", robux);
    if (newRobux === null) return;

    const newTickets = prompt("Set Price in Tickets (0 for Free):", tickets);
    if (newTickets === null) return;

    if (typeof _supabase !== 'undefined') {
        const { error } = await _supabase
            .from('assets')
            .update({
                description: newDesc,
                price_robux: parseInt(newRobux) || 0,
                price_tickets: parseInt(newTickets) || 0
            })
            .eq('id', assetId);

        if (error) alert("Error updating asset: " + error.message);
        else location.reload();
    }
}

async function deleteAsset(assetId) {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    if (typeof _supabase !== 'undefined') {
        const { error } = await _supabase.from('assets').delete().eq('id', assetId);
        if (error) alert("Failed to delete asset: " + error.message);
        else location.reload();
    }
}
