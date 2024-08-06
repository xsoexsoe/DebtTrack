function navigateToGoogleMaps(latitude, longitude) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
}
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Popup"
], function(Map, MapView, Graphic, GraphicsLayer, Popup) {
    const map = new Map({
        basemap: "streets-navigation-vector"
    });

    const graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    function createNavigationButton(latitude, longitude) {
        return `
        <div class="navigation-button">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank">
                <i class="fas fa-directions" style="color: crimson;"></i>
            </a>
            <span>เส้นทาง</span>
        </div>`;
    }

    function setMapView(latitude, longitude) {
        const view = new MapView({
            container: "viewDiv",
            map: map,
            center: [longitude, latitude], // Use Khong Chiam's coordinates as the center
            zoom: 12 // Initial zoom level
        });

        const userPoint = {
            type: "point",
            longitude: longitude,
            latitude: latitude
        };

        const userMarkerSymbol = {
            type: "simple-marker",
            color: [0, 0, 255],
            outline: {
                color: [255, 255, 255],
                width: 1
            }
        };

        const userPointGraphic = new Graphic({
            geometry: userPoint,
            symbol: userMarkerSymbol,
            popupTemplate: {
                title: "ตำแหน่งเริ่มต้น",
                content: createNavigationButton(latitude, longitude) // Call the function to create the button
            }
        });

        graphicsLayer.add(userPointGraphic);

        // Fetch debtor data from the server
        // ตรวจสอบว่าอยู่ในสภาพแวดล้อมไหน
        const isLocal = window.location.hostname === 'localhost';
        const apiUrl = isLocal
            ? 'http://172.21.1.58:3000/debtors' // URL สำหรับการพัฒนาในเครื่อง
            : 'http://localhost:3000/debtors'; // URL สำหรับทดสอบจากเครื่องอื่น

        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                console.warn('No debtor data available.');
                return;
            }

            data.forEach(debtor => {
                if (!debtor.latitude || !debtor.longitude) {
                    console.warn('Missing coordinates for debtor:', debtor);
                    return;
                }

                const point = {
                    type: "point",
                    longitude: debtor.longitude,
                    latitude: debtor.latitude
                };

                const markerSymbol = {
                    type: "simple-marker",
                    color: [226, 119, 40],
                    outline: {
                        color: [255, 255, 255],
                        width: 1
                    }
                };

                const pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol,
                    attributes: debtor,
                    popupTemplate: {
                        title: debtor.name,
                        content: createNavigationButton(debtor.latitude, debtor.longitude)
                    }
                });

                graphicsLayer.add(pointGraphic);
            });
        })
        .catch(error => {
            console.error('Error fetching debtor data:', error);
            alert('Error loading debtor data. Please try again later.');
        });
    }

    // ตั้งค่าแผนที่ไปยังอำเภอเขมราฐ
    setMapView(16.0506, 105.2221); // Khong Chiam coordinates
});
