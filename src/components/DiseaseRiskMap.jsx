import React, { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { getTelemetryData } from '../multilingual_data';
import { ODISHA_CENTER } from '../config/constants';
import { useApp } from '../context/AppContext';

// Just the map and nothing else - no title bar, no list, no controls chrome of
// its own. Tap a marker to read the record. It reads the advisory records
// bundled with the app, so there is no backend and no account. The Google Maps
// script is the one part that needs a connection and a key of your own.

const mapContainerStyle = {
  width: '100%',
  height: '240px'
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false
};

// Severity arrives already localised ("High" / "ଉଚ୍ଚ" / "उच्च"), so the translated
// string is the only thing to classify. Keeping the spellings in one place means
// the marker colour can never disagree with the InfoWindow.
const severityKey = (severity) => {
  const value = String(severity || '').trim().toLowerCase();
  if (value === 'high' || value === 'ଉଚ୍ଚ' || value === 'उच्च') return 'high';
  if (value === 'moderate' || value === 'ମଧ୍ୟମ' || value === 'मध्यम') return 'moderate';
  return 'low';
};

const MARKER_ICON = {
  high: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  moderate: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
  low: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
};

const Placeholder = ({ children }) => (
  <div className="w-full h-[240px] bg-gray-100 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
    <MapPin size={20} className="text-gray-400" />
    <p className="font-mono text-[9px] text-gray-600 leading-snug">{children}</p>
  </div>
);

/**
 * The map only. Mounts the Google Maps script once a key is present.
 *
 * The script is loaded by key, not by app: changing the key in Settings remounts
 * this subtree (the `key` prop), so a corrected key takes effect without a full
 * page reload - the loader memoises per script id, and the id includes the key.
 */
function MapCanvas({ zone, records }) {
  const { mapsKey, t } = useApp();

  const center = zone && zone.lat && zone.lng
    ? { lat: zone.lat, lng: zone.lng }
    : ODISHA_CENTER;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: mapsKey,
    id: 'krishisetu-gmaps-' + mapsKey.slice(-8),
    libraries: ['places']
  });

  const [selected, setSelected] = useState(null);

  if (loadError) {
    return <Placeholder>{t('mapsKeyRejected')}</Placeholder>;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[240px] bg-gray-100 flex items-center justify-center">
        <p className="font-bold text-[10px] text-gray-500 uppercase">{t('loadingMaps')}</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zone && zone.lat ? 8 : 7}
      options={mapOptions}
    >
      {records.map((record, idx) => (
        <Marker
          key={`${record.origin}-${idx}`}
          position={{ lat: record.lat, lng: record.lng }}
          onClick={() => setSelected(record)}
          icon={{
            url: MARKER_ICON[severityKey(record.severity)],
            scaledSize: { width: 32, height: 32 }
          }}
        />
      ))}

      {selected && (
        <InfoWindow
          position={{ lat: selected.lat, lng: selected.lng }}
          onCloseClick={() => setSelected(null)}
        >
          <div className="p-1 font-sans max-w-[190px]">
            <p className="font-bold text-xs">{selected.pest}</p>
            <p className="text-[11px] text-gray-600">{selected.crop}</p>
            <p className="text-[11px] mt-0.5">{selected.origin} &rarr; {selected.target}</p>
            <p className="text-[11px] mt-1">{selected.advice}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

/**
 * District-level pest and disease risk for Odisha.
 *
 * @param {Object} [zone] - currently selected soil zone, used to centre the map
 */
export default function DiseaseRiskMap({ zone }) {
  const { t, appLanguage, isOnline, mapsKey } = useApp();

  const records = useMemo(
    () => getTelemetryData(appLanguage).filter((r) => r.lat && r.lng),
    [appLanguage]
  );

  // Explaining which of the two reasons it is beats a grey box, and neither is
  // something the user can fix from inside the map card.
  if (!mapsKey) {
    return (
      <div className="bg-white border-2 border-black shadow-brutal-sm">
        <Placeholder>{t('mapsNeedsKey')}</Placeholder>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="bg-white border-2 border-black shadow-brutal-sm">
        <Placeholder>{t('riskMapOffline')}</Placeholder>
      </div>
    );
  }

  return (
    <div className="relative bg-white border-2 border-black shadow-brutal-sm overflow-hidden">
      <MapCanvas key={mapsKey} zone={zone} records={records} />
    </div>
  );
}
