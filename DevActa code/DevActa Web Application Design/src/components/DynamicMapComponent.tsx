import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different startup stages
const ideaIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mvpIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const growthIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const scaleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Startup {
  id: string;
  name: string;
  description: string;
  location: [number, number];
  founder: string;
  website?: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  employees: number;
  founded: string;
  tags: string[];
}

interface DynamicMapComponentProps {
  startups: Startup[];
  onStartupSelect: (startup: Startup) => void;
  onMapClick: (location: [number, number]) => void;
}

const DynamicMapComponent = forwardRef<any, DynamicMapComponentProps>(({ startups, onStartupSelect, onMapClick }, ref) => {
  console.log("DynamicMapComponent rendering with startups:", startups);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userLocationRef = useRef<L.Marker | null>(null);

  const getIcon = (stage: string) => {
    switch (stage) {
      case 'idea':
        return ideaIcon;
      case 'mvp':
        return mvpIcon;
      case 'growth':
        return growthIcon;
      case 'scale':
        return scaleIcon;
      default:
        return L.Icon.Default.prototype;
    }
  };

  const centerOnUserLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapInstanceRef.current?.setView([latitude, longitude], 12);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  useImperativeHandle(ref, () => ({
    centerOnUserLocation
  }));

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    console.log('Initializing map...');
    
    // Initialize map
    const map = L.map(mapRef.current).setView([20, 0], 2);
    mapInstanceRef.current = map;
    
    console.log('Map initialized:', map);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location:', latitude, longitude);
          
          // Set map view to user's location
          map.setView([latitude, longitude], 10);
          
          // Add a marker for user's current location
          const userIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          userLocationRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('<div class="p-2"><h3 class="font-semibold text-sm">Your Location</h3><p class="text-xs text-gray-600 mt-1">You are here</p></div>');
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Keep default view if geolocation fails
        }
      );
    }

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click handler for map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onMapClick([lat, lng]);
    });

    // Handle window resize
    const handleResize = () => {
      if (mapInstanceRef.current) {
        setTimeout(() => {
          mapInstanceRef.current?.invalidateSize();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, []); // Empty dependency array since onMapClick is now stable

  // Update markers when startups change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    startups.forEach((startup) => {
      const marker = L.marker(startup.location, { icon: getIcon(startup.stage) })
        .addTo(mapInstanceRef.current!)
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${startup.name}</h3>
            <p class="text-xs text-gray-600 mt-1">${startup.founder}</p>
            <p class="text-xs text-gray-500 mt-1">${startup.industry} • ${startup.employees} employees</p>
            <span class="inline-block px-2 py-1 text-xs rounded mt-2 ${
              startup.stage === 'idea' ? 'bg-gray-500 text-white' :
              startup.stage === 'mvp' ? 'bg-blue-500 text-white' :
              startup.stage === 'growth' ? 'bg-green-500 text-white' :
              'bg-purple-500 text-white'
            }">
              ${startup.stage}
            </span>
          </div>
        `);

      marker.on('click', () => {
        onStartupSelect(startup);
      });

      markersRef.current.push(marker);
    });
  }, [startups, onStartupSelect]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-screen bg-gray-100 relative z-0"
      style={{ 
        height: '100vh', 
        width: '100%',
        zIndex: 1
      }} 
    >

      {!mapInstanceRef.current && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">Loading Map...</div>
            <div className="text-sm">Click anywhere to add your startup</div>
            <div className="text-xs mt-2">Map container: {mapRef.current ? 'Found' : 'Not found'}</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default DynamicMapComponent;

