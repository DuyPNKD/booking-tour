const db = require("../config/db");

exports.getNavbarMenu = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                r.id AS region_id,
                r.name AS region_name,
                r.display_name,
                sr.id AS subregion_id,
                sr.name AS subregion_name,
                l.id AS location_id,
                l.name AS location_name
            FROM regions r
            LEFT JOIN subregions sr ON sr.region_id = r.id
            LEFT JOIN locations l ON l.subregion_id = sr.id
            ORDER BY r.id, sr.id, l.id\
        `);

        const result = {
            domestic: [],
            international: [],
        };

        rows.forEach((row) => {
            const targetGroup = row.display_name?.startsWith("Tour Miền") ? result.domestic : result.international;

            let region = targetGroup.find((r) => r.id === row.region_id);
            if (!region) {
                region = {
                    id: row.region_id,
                    name: row.region_name,
                    displayName: row.display_name,
                    destinations: [],
                };
                targetGroup.push(region);
            }
            // Tìm group (subregion) trong region.destinations
            let subregion = region.destinations.find((d) => d.group === row.subregion_name);
            if (!subregion) {
                subregion = {
                    id: row.subregion_id,
                    group: row.subregion_name,
                    places: [],
                };
                region.destinations.push(subregion);
            }

            // Thêm location vào places
            if (row.location_name) {
                subregion.places.push({id: row.location_id, name: row.location_name});
            }
        });

        res.json(result);
    } catch (error) {
        console.error("❌ Lỗi khi lấy navbar:", error.message);
        res.status(500).json({message: "Lỗi server"});
    }
};
