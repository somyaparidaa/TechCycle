import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { MapPin } from "lucide-react";
import "../styles/RecyclingMap.css";

function RecyclingMap() {
  // States for map and search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default center (e.g., India)
  const [zoom, setZoom] = useState(4); // Default zoom (zoomed out)
  const [markers, setMarkers] = useState([]); // Generated nearby markers
  const [suggestions, setSuggestions] = useState([]); // Suggestion list from geocoding API
  const [selectedMarker, setSelectedMarker] = useState(null); // For info window display

  // Generate random nearby markers around a given coordinate
  const generateNearbyCenters = ({ lat, lng }) => {
    const count = Math.floor(Math.random() * (15 - 10 + 1)) + 10; // 10 to 15 markers
    const generated = [];
    for (let i = 0; i < count; i++) {
      const offsetLat = (Math.random() - 0.5) * 0.04;
      const offsetLng = (Math.random() - 0.5) * 0.04;
      generated.push({
        id: `nearby-${i}`,
        name: `Nearby E-Waste Center ${i + 1}`,
        position: { lat: lat + offsetLat, lng: lng + offsetLng },
        address: `Auto-Generated Address ${i + 1}`,
        phone: "(555) 000-0000",
      });
    }
    return generated;
  };

  // Fetch location suggestions (using OpenStreetMap/Nominatim for geocoding)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // When a suggestion is selected: update map center, zoom, markers, and search input.
  const handleSuggestionSelect = (sug) => {
    const { lat, lon, display_name } = sug;
    const newCenter = { lat: parseFloat(lat), lng: parseFloat(lon) };

    setMapCenter(newCenter);
    setZoom(16);

    const newMarkers = generateNearbyCenters(newCenter);
    setMarkers(newMarkers);

    setSearchQuery(display_name);
    setSuggestions([]);
  };

  // If the user clicks "Search" without selecting a suggestion,
  // use the first result from Nominatim.
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        handleSuggestionSelect(data[0]);
      } else {
        alert("Location not found. Please try a different query.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      alert("An error occurred while searching for the location.");
    }
  };

  // Google Maps container style
  const mapContainerStyle = {
    height: "100%",
    width: "100%",
  };

  const googleMapsApiKey = "AIzaSyBeLiZPuc0TLEot4PhA1rPYwuYRx2R7zCc"; // Replace with your API key

  return (
    <div className="container">
      <h2 className="title">E-Waste Recycling Centers</h2>
      <div className="grid">
        {/* MAP AREA */}
        <div className="map-container">
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={zoom}
            >
              {markers.map((m) => (
                <Marker
                  key={m.id}
                  position={m.position}
                  onClick={() => setSelectedMarker(m)}
                />
              ))}
              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.position}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div>
                    <h3 className="popup-title">{selectedMarker.name}</h3>
                    <p>{selectedMarker.address}</p>
                    <p>{selectedMarker.phone}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* SIDEBAR AREA */}
        <div className="info-section">
          <div className="search-box">
            <h3 className="search-title">Find Centers Near You</h3>
            <input
              type="text"
              placeholder="Enter your location"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((sug) => (
                  <li
                    key={sug.place_id}
                    className="suggestion-item"
                    onClick={() => handleSuggestionSelect(sug)}
                  >
                    {sug.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="centers-list">
            {markers.map((m) => (
              <div key={m.id} className="center-card">
                <div className="center-info">
                  <MapPin className="icons" />
                  <div>
                    <h4 className="center-name">{m.name}</h4>
                    <p className="center-address">{m.address}</p>
                    <p className="center-phone">{m.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecyclingMap;
