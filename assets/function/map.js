function navigateToGoogleMaps(latitude, longitude) {
    var url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(url, '_blank');
}

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/widgets/Popup"
], function(Map, MapView, Graphic, GraphicsLayer, Popup) {
    var map = new Map({
        basemap: "streets-navigation-vector"
    });

    var view = new MapView({
        container: "viewDiv",
        map: map,
        center: [100.523186, 13.736717], // พิกัดเริ่มต้น
        zoom: 6
    });

    var graphicsLayer = new GraphicsLayer();
    map.add(graphicsLayer);

    // ดึงข้อมูลลูกหนี้จากเซิร์ฟเวอร์
    fetch('http://localhost:5500/debtors') // เปลี่ยน URL นี้ให้เป็น API endpoint ที่ถูกต้อง
        .then(response => response.json())
        .then(data => {
            data.forEach(function(debtor) {
                var point = {
                    type: "point",
                    longitude: debtor.longitude,
                    latitude: debtor.latitude
                };

                var markerSymbol = {
                    type: "simple-marker",
                    color: [226, 119, 40],
                    outline: {
                        color: [255, 255, 255],
                        width: 1
                    }
                };

                var pointGraphic = new Graphic({
                    geometry: point,
                    symbol: markerSymbol,
                    attributes: debtor,
                    popupTemplate: {
                        title: debtor.name,
                        content: '<a href="https://www.google.com/maps/dir/?api=1&destination=' + debtor.latitude + ',' + debtor.longitude + '" target="_blank">นำทาง</a>'
                    }
                });

                graphicsLayer.add(pointGraphic);
            });
        });

    // ฟังก์ชั่นสำหรับแสดงตำแหน่งปัจจุบัน
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            var userPoint = {
                type: "point",
                longitude: longitude,
                latitude: latitude
            };

            var userMarkerSymbol = {
                type: "simple-marker",
                color: [0, 0, 255],
                outline: {
                    color: [255, 255, 255],
                    width: 1
                }
            };

            var userPointGraphic = new Graphic({
                geometry: userPoint,
                symbol: userMarkerSymbol,
                popupTemplate: {
                    title: "ตำแหน่งปัจจุบันของคุณ",
                    content: '<a href="https://www.google.com/maps/dir/?api=1&destination=' + latitude + ',' + longitude + '" target="_blank">นำทาง</a>'
                }
            });

            graphicsLayer.add(userPointGraphic);

            // ซูมไปที่ตำแหน่งปัจจุบัน
            view.goTo({
                target: userPoint,
                zoom: 12
            });
        });
    } else {
        alert("เบราว์เซอร์ของคุณไม่รองรับการหาตำแหน่งปัจจุบัน");
    }
});
