import {useCallback, useEffect, useState} from 'react';
import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {ExternalLink, MapPin} from 'lucide-react';
import {BUSINESS_INFO} from '../data/businessConfig';

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Neutral origin before Places API (New) resolves the verified shop location
const NEUTRAL_ORIGIN = {lat: 0, lng: 0};

interface ResolvedLocation {
  position: {lat: number; lng: number};
  formattedAddress: string;
}

function ShopLocationMarkerAndResolver({
  onResolved,
}: {
  onResolved: (isResolved: boolean) => void;
}) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [resolved, setResolved] = useState<ResolvedLocation | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  const resolveShopAddress = useCallback(async () => {
    if (!placesLib || !map) return;
    setLookupState('loading');
    try {
      const {places} = await placesLib.Place.searchByText({
        textQuery: BUSINESS_INFO.mapSearchQuery,
        fields: ['displayName', 'formattedAddress', 'location', 'viewport'],
        maxResultCount: 1,
        language: 'en',
        region: 'IN',
      });

      const match = places?.[0];
      if (match?.location) {
        const position = {
          lat: match.location.lat(),
          lng: match.location.lng(),
        };
        setResolved({
          position,
          formattedAddress:
            match.formattedAddress || BUSINESS_INFO.fullAddress,
        });
        if (match.viewport) {
          map.fitBounds(match.viewport);
          const currentZoom = map.getZoom();
          if (typeof currentZoom === 'number' && currentZoom > 17) {
            map.setZoom(16);
          }
        } else {
          map.setCenter(position);
          map.setZoom(16);
        }
        map.panBy(0, -48);
        onResolved(true);
        setLookupState('done');
      } else {
        onResolved(true);
        setLookupState('done');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('OVER_QUERY_LIMIT') ||
        msg.includes('Quota')
      ) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
      }
      onResolved(true);
      setLookupState('error');
    }
  }, [placesLib, map, onResolved]);

  useEffect(() => {
    if (placesLib && map && lookupState === 'idle') {
      void resolveShopAddress();
    }
  }, [placesLib, map, lookupState, resolveShopAddress]);

  if (!resolved) {
    return null;
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={resolved.position}
        title={BUSINESS_INFO.name}
        onClick={() => setInfoOpen(true)}
      >
        <Pin
          background="#0b192c"
          borderColor="#f59e0b"
          glyphColor="#f59e0b"
          scale={1.15}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-slate-900">
            <p className="font-display font-bold text-sm text-navy-900 mb-1">
              {BUSINESS_INFO.name}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              {BUSINESS_INFO.fullAddress}
            </p>
            <a
              href={BUSINESS_INFO.googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 underline"
            >
              <span>Open Directions</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MapViewport() {
  const status = useApiLoadingStatus();
  const [resolvedReady, setResolvedReady] = useState(false);

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return <MapFallbackCard />;
  }

  return (
    <div className="relative w-full h-[340px] sm:h-[380px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      <GoogleMap
        defaultCenter={NEUTRAL_ORIGIN}
        defaultZoom={2}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        mapTypeControl={false}
        streetViewControl={false}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{width: '100%', height: '100%'}}
      >
        <ShopLocationMarkerAndResolver onResolved={setResolvedReady} />
      </GoogleMap>
      {!resolvedReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-100/80 backdrop-blur-[1px]">
          <p className="text-xs font-medium text-navy-900 bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-sm">
            Locating Krishna Battery Service on Google Maps...
          </p>
        </div>
      )}
    </div>
  );
}

function MapFallbackCard() {
  return (
    <div className="w-full h-[340px] sm:h-[380px] rounded-xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-navy-900 text-amber-400 flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold text-navy-900 mb-2">
        {BUSINESS_INFO.name}
      </h3>
      <p className="text-sm text-slate-600 max-w-md leading-relaxed mb-5">
        {BUSINESS_INFO.fullAddress}
      </p>
      <a
        href={BUSINESS_INFO.googleMapsDirectionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
      >
        <span>Open Shop Location in Google Maps</span>
        <ExternalLink className="w-4 h-4" aria-hidden="true" />
      </a>
    </div>
  );
}

export function ShopLocationMap() {
  return (
    <div className="space-y-3" data-testid="shop-location-map">
      {MAPS_API_KEY ? (
        <APIProvider
          apiKey={MAPS_API_KEY}
          language="en"
          region="IN"
          libraries={['places', 'marker']}
        >
          <MapViewport />
        </APIProvider>
      ) : (
        <MapFallbackCard />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          Madha Nagar Main Road, Madhananthapuram, Mugalivakkam, Chennai 600125
        </span>
        <a
          href={BUSINESS_INFO.googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-navy-900 hover:text-amber-700 transition-colors whitespace-nowrap"
        >
          <span>Get Directions on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
