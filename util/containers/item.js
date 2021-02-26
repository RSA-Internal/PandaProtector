function createItem(name, buy = 0, sell = 0, amount = 0, id, localized, category = "Items", rarity = "Common", rating = 0, buyable = true, sellable = true) {
    return {
        name: name,
        buy: buy,
        sell: sell,
        amount: amount,
        id: id,
        localized: localized,
        category: category,
        rarity: rarity,
        rating: rating,
        buyable: buyable,
        sellable: sellable
    }
}

module.exports = {
    'boot': createItem('Boot', 5, 2, 0, 1, 'boot', 'Items', 'Common', 0, true, true),
    'fish': createItem('Fish', 10, 6, 0, 2, 'fish', 'Items', 'Common', 0, true, true),
    'kelp': createItem('Kelp', 7, 3, 0, 3, 'kelp', 'Items', 'Uncommon', 0, true, true),
    'seeds': createItem('Seeds', 5, 1, 0, 4, 'seeds', 'Items', 'Common', 0, true, true),
    'wheat': createItem('Wheat', 10, 4, 0, 5, 'wheat', 'Items', 'Common', 0, true, true),
    'carrot': createItem('Carrot', 7, 3, 0, 6, 'carrot', 'Items', 'Common', 0, true, true),
    'potato': createItem('Potato', 15, 4, 0, 7, 'potato', 'Items', 'Common', 0, true, true),
    'hide': createItem('Hide', 60, 25, 0, 8, 'hide', 'Items', 'Common', 0, true, true),
    'antler': createItem('Antler', 44, 15, 0, 9, 'antler', 'Items', 'Uncommon', 0, true, true),
    'raw_meat': createItem('Raw Meat', 12, 7, 0, 10, 'raw_meat', 'Items', 'Common', 0, true, true),
    'cooked_meat': createItem('Cooked Meat', 30, 18, 0, 11, 'cooked_meat', 'Items', 'Rare', 0, true, true),
    'gios_rose': createItem('Gio\'s Rose', 0, 0, 0, 12, 'gios_rose', 'Items', 'Forbidden', 0, false, false),
    'planet': createItem('Planet', 0, 0, 0, 720, 'planet', 'Collectables', 'Forbidden', 0, false, false),
    'femboy': createItem('Femboy', 0, 0, 0, 69, 'femboy', 'Collectables', 'Forbidden', 0, false, false),
}