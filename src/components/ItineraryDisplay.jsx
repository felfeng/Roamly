import React from "react";

function ItineraryDisplay({ itinerary }) {
  return (
    <div className="itinerary">
      <h2>Your Day Trip Itinerary</h2>
      <div className="itinerary-list">
        {itinerary.map((item, index) => (
          <React.Fragment key={index}>
            <div className="itinerary-item">
              <span className="time">{item.time}</span>
              <span className="place">{item.place}</span>
              <span className="type">{item.type}</span>
              <span className="coordinates">
                ({item.lat}, {item.lon})
              </span>
            </div>
            {index < itinerary.length - 1 && (
              <div className="transportation-info">
                <span className="distance">{item.nextDistance} km</span>
                <span className="transport-method">
                  {item.nextTransportMethod}
                </span>
                <span className="transport-details">
                  {item.nextTransportDetails}
                </span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ItineraryDisplay;
