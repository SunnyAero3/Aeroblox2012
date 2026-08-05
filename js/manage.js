/**
 * js/manage.js - aeroblox2012 Main Site Inventory & Management Engine
 */

// Global helper to get current session user
function getLoggedInUser() {
    return localStorage.getItem("aeroUserId") || "uav3y5le";
}

/**
 * Renders an inventory item card.
 * - Clicking the card opens Item.aspx?id=ASSET_ID
 * - 3-dots menu ONLY renders on index.html AND if the user owns the item.
 */
function renderInventoryCard(asset) {
    const currentUser = getLoggedInUser();
    const isOwner = (asset.uploader_id === currentUser);
    
    // Strict check: Only show 3-dots menu on root index.html, NOT on profile.html
    const isIndexPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");
    const showThreeDots = isOwner && isIndexPage;

    const safeDesc = encodeURIComponent(asset.description || '');
    const safeName = encodeURIComponent(asset.name || '');

    return `
        <div class="inventory-card" style="position: relative; border: 1px solid #a7bacb; background: #fff; padding: 6px; width: 130px; text-align: center; margin: 5px; display: inline-block;">
            ${showThreeDots ? renderIndexContextMenu(asset.id, safeDesc, asset.price_robux, asset.price_tickets) : ''}
            
            <div class="inventory-link" onclick="navigateToItem(${asset.id})" style="cursor: pointer;">
                <img src="${asset.preview_url || 'images/default_asset.png'}" alt="${asset.name}" style="width: 110px; height: 110px; object-fit: contain; border: 1px solid #e0e0e0; background: #fafafa;">
                <div style="font-size: 11px; font-weight: bold; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #003366;" title="${asset.name}">${asset.name}</div>
                <div style="font-size: 10px; color: #008000; margin-top: 2px;">R$: ${asset.price_robux || 0} | Tix: ${asset.price_tickets || 0}</div>
            </div>
        </div>
    `;
}

// Redirects user to the item detail page
function navigateToItem(assetId) {
    window.location.href = `Item.aspx?id=${assetId}`;
}

// Generates the 3-dots menu HTML
function renderIndexContextMenu(assetId, encodedDesc, priceRobux, priceTickets) {
    return `
        <div class="context-menu-container" style="position: absolute; top: 4px; right: 4px; z-index: 50;">
            <button type="button" class="three-dots-btn" onclick="toggleContextMenu(event, ${assetId})" style="background: rgba(255,255,255,0.9); border: 1px solid #7a7a7a; border-radius: 3px; cursor: pointer; padding: 1px 5px; font-weight: bold; font-size: 11px; line-height: 12px;">&#8942;</button>
            <div id="context-menu-${assetId}" class="context-menu-dropdown" style="display: none; position: absolute; right: 0; top: 18px; background: #ffffff; border: 1px solid #7a7a7a; box-shadow: 2px 2px 6px rgba(0,0,0,0.3); min-width: 130px; border-radius: 2px; text-align: left;">
                <button onclick="editAssetDetails(event, ${assetId}, '${encodedDesc}', ${priceRobux}, ${priceTickets})" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:11px; color:#333;">Edit Details</button>
                <button onclick="deleteAsset(event, ${assetId})" style="width:100%; text-align:left; padding:6px 10px; background:none; border:none; cursor:pointer; font-size:11px; color:#cc0000;">Delete Item</button>
            </div>
        </div>
    `;
}

function toggleContextMenu(event, assetId) {
    event.stopPropagation(); // Prevents clicking the 3-dots from triggering navigateToItem
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

async function editAssetDetails(event, assetId, encodedDesc, robux, tickets) {
    event.stopPropagation();
    const desc = decodeURIComponent(encodedDesc);
    const newDesc = prompt("Update Item Description:", desc);
    if (newDesc === null) return;

    const newRobux = prompt("Set Price in Robux:", robux);
    if (newRobux === null) return;

    const newTickets = prompt("Set Price in Tickets:", tickets);
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

async function deleteAsset(event, assetId) {
    event.stopPropagation();
    if (!confirm("Are you sure you want to delete this asset?")) return;

    if (typeof _supabase !== 'undefined') {
        const { error } = await _supabase.from('assets').delete().eq('id', assetId);
        if (error) alert("Failed to delete asset: " + error.message);
        else location.reload();
    }
}

/**
 * Loads inventory items into a given target container element
 */
async function loadInventorySection(containerId, userId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (typeof _supabase !== 'undefined') {
        const { data: assets, error } = await _supabase
            .from('assets')
            .select('*')
            .eq('uploader_id', userId)
            .order('created_at', { ascending: false });

        if (error || !assets || assets.length === 0) {
            container.innerHTML = "<p style='font-size:11px; color:#666;'>No items found in inventory.</p>";
            return;
        }

        container.innerHTML = assets.map(asset => renderInventoryCard(asset)).join('');
    }
}
