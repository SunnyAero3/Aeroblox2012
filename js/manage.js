/**
 * js/manage.js - AeroBLOX 2012 Classic Inventory & Management Engine
 */

let currentInventoryCategory = 'All';

function getLoggedInUser() {
    return localStorage.getItem("aeroUserId") || "uav3y5le";
}

// Navigates directly to item details page
function navigateToItem(assetId) {
    window.location.href = `Item.aspx?id=${assetId}`;
}

// Generates the 3-dots menu HTML
function renderIndexContextMenu(assetId, encodedDesc, priceRobux, priceTickets) {
    return `
        <div class="context-menu-container" style="position: absolute; top: 3px; right: 3px; z-index: 50;">
            <button type="button" class="three-dots-btn" onclick="toggleContextMenu(event, ${assetId})" style="background: rgba(255,255,255,0.9); border: 1px solid #7a7a7a; border-radius: 2px; cursor: pointer; padding: 0 4px; font-weight: bold; font-size: 11px; line-height: 12px;">&#8942;</button>
            <div id="context-menu-${assetId}" class="context-menu-dropdown" style="display: none; position: absolute; right: 0; top: 16px; background: #ffffff; border: 1px solid #7a7a7a; box-shadow: 2px 2px 6px rgba(0,0,0,0.3); min-width: 120px; border-radius: 2px; text-align: left;">
                <button onclick="editAssetDetails(event, ${assetId}, '${encodedDesc}', ${priceRobux}, ${priceTickets})" style="width:100%; text-align:left; padding:5px 8px; background:none; border:none; cursor:pointer; font-size:10px; color:#333;">Edit Details</button>
                <button onclick="deleteAsset(event, ${assetId})" style="width:100%; text-align:left; padding:5px 8px; background:none; border:none; cursor:pointer; font-size:10px; color:#cc0000;">Delete Item</button>
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

function renderInventoryCard(asset) {
    const currentUser = getLoggedInUser();
    const isOwner = (asset.uploader_id === currentUser);
    
    // Strict check: Only show 3-dots menu when on index.html
    const isIndexPage = window.location.pathname.endsWith("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");
    const showThreeDots = isOwner && isIndexPage;

    const safeDesc = encodeURIComponent(asset.description || '');

    return `
        <div class="stuff-card" style="position: relative; border: 1px solid #d0d0d0; background: #fff; padding: 5px; width: 105px; text-align: center; font-size: 10px;">
            ${showThreeDots ? renderIndexContextMenu(asset.id, safeDesc, asset.price_robux, asset.price_tickets) : ''}
            
            <div onclick="navigateToItem(${asset.id})" style="cursor: pointer;">
                <div style="width: 95px; height: 95px; border: 1px solid #eee; background: #fafafa; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px auto;">
                    <img src="${asset.preview_url || 'images/default_asset.png'}" alt="${asset.name}" style="max-width: 90px; max-height: 90px; object-fit: contain;">
                </div>
                <div style="font-weight: bold; color: #003366; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;" title="${asset.name}">${asset.name}</div>
                <div style="font-size: 9px; color: #555;">Creator: <span style="color: #003366; text-decoration: underline;">${asset.creator_name || 'AeroBLOX'}</span></div>
            </div>
        </div>
    `;
}

function filterStuffCategory(categoryName, userId, targetContainerId) {
    currentInventoryCategory = categoryName;
    
    // Highlight selected tab
    document.querySelectorAll('.stuff-tab-btn').forEach(btn => {
        if (btn.innerText.trim() === categoryName) {
            btn.style.background = '#e2e7ed';
            btn.style.fontWeight = 'bold';
            btn.style.borderRight = '3px solid #003366';
        } else {
            btn.style.background = '#f7f7f7';
            btn.style.fontWeight = 'normal';
            btn.style.borderRight = 'none';
        }
    });

    loadInventorySection(targetContainerId, userId, categoryName);
}

async function loadInventorySection(containerId, userId, categoryFilter = 'All') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (typeof _supabase !== 'undefined') {
        let query = _supabase
            .from('assets')
            .select('*')
            .eq('uploader_id', userId);

        if (categoryFilter !== 'All') {
            query = query.eq('asset_type', categoryFilter);
        }

        const { data: assets, error } = await query.order('created_at', { ascending: false });

        if (error || !assets || assets.length === 0) {
            container.innerHTML = `<p style="font-size: 11px; color: #666; margin: 15px 0;">No items found in category "${categoryFilter}".</p>`;
            return;
        }

        container.innerHTML = assets.map(asset => renderInventoryCard(asset)).join('');
    }
}
