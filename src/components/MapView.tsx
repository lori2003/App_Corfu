import { useEffect, useMemo } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { Coordinates, Poi } from '../types';
import { CATEGORY_MAP } from '../config/categories';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '../config/landmarks';
import { formatDistance } from '../lib/distance';

interface MapViewProps {
  /** Posizione dell'alloggio (marker principale). */
  rental?: Coordinates | null;
  /** POI da mostrare (già filtrati). */
  pois?: Poi[];
  /** Se definito, abilita la modalità "scegli punto sulla mappa". */
  onPick?: (coords: Coordinates) => void;
  /** Coordinata su cui ricentrare quando cambia (es. focus da lista). */
  focus?: Coordinates | null;
  /** Contenuto extra del popup del marker alloggio. */
  rentalLabel?: string;
  /** Render di azioni nel popup di un POI. */
  renderPoiActions?: (poi: Poi) => React.ReactNode;
}

function emojiIcon(emoji: string, color: string, size = 30): L.DivIcon {
  return L.divIcon({
    className: 'poi-marker',
    html: `<span style="--marker-color:${color}">${emoji}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

const rentalIcon = L.divIcon({
  className: 'rental-marker',
  html: '<span>🏠</span>',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -38],
});

/** Aggiorna la vista quando cambia il punto su cui ricentrare. */
function Recenter({ focus }: { focus?: Coordinates | null }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView([focus.lat, focus.lon], Math.max(map.getZoom(), 15));
    // Dipende dall'identità di `focus`: ogni richiesta di ricentratura passa un
    // nuovo oggetto, così la mappa si ricentra anche sulle stesse coordinate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);
  return null;
}

/** Cattura i clic sulla mappa in modalità selezione. */
function PickHandler({ onPick }: { onPick: (c: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export function MapView({
  rental,
  pois = [],
  onPick,
  focus,
  rentalLabel,
  renderPoiActions,
}: MapViewProps) {
  const initialCenter = rental ?? DEFAULT_MAP_CENTER;
  const poiIcons = useMemo(() => {
    const cache = new Map<string, L.DivIcon>();
    return (poi: Poi) => {
      const def = CATEGORY_MAP[poi.category];
      const key = poi.category;
      if (!cache.has(key)) cache.set(key, emojiIcon(def.emoji, def.color));
      return cache.get(key)!;
    };
  }, []);

  return (
    <MapContainer
      center={[initialCenter.lat, initialCenter.lon]}
      zoom={rental ? 15 : DEFAULT_MAP_ZOOM}
      className="map-view"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {onPick && <PickHandler onPick={onPick} />}
      <Recenter focus={focus} />

      {rental && (
        <Marker
          position={[rental.lat, rental.lon]}
          icon={rentalIcon}
          draggable={!!onPick}
          eventHandlers={
            onPick
              ? {
                  dragend: (e) => {
                    const p = (e.target as L.Marker).getLatLng();
                    onPick({ lat: p.lat, lon: p.lng });
                  },
                }
              : undefined
          }
        >
          {rentalLabel && <Popup>{rentalLabel}</Popup>}
        </Marker>
      )}

      {pois.map((poi) => (
        <Marker
          key={poi.id}
          position={[poi.coordinates.lat, poi.coordinates.lon]}
          icon={poiIcons(poi)}
        >
          <Popup>
            <div className="poi-popup">
              <strong>{poi.name}</strong>
              <div className="poi-popup__meta">
                {CATEGORY_MAP[poi.category].labelIt} ·{' '}
                {formatDistance(poi.distanceMeters)}
              </div>
              {renderPoiActions && (
                <div className="poi-popup__actions">{renderPoiActions(poi)}</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
