import * as Leaflet from 'leaflet';
require('leaflet');
require('leaflet.markercluster');
import 'mapbox.js';

import { BaseComponent } from "./base-component";
import { Widget } from '../widget';


const L = (window as any).L as typeof Leaflet;

export class LeafletMap extends BaseComponent<LeafletConfig> {
  map: L.Map;
  featureGroups: L.FeatureGroup[] = [];

  constructor(element: Element|JQuery<HTMLElement>, widget: Widget) {
    super(element, widget);
    this.map = L.map(this.element[0], this.config.mapOptions);
    this.map.setView(this.config.initialLatLng, this.config.initialZoom);

    const osmAttrib = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>';
    L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
        attribution: osmAttrib,
        minZoom: 5,
        maxZoom: 17,
        opacity: 0.9
    }).addTo(this.map);
    L.control.scale().addTo(this.map);
  }

  addFeatureGroups() {
    if (this.config.featureGroups) {
      for (const featureGroupConfig of this.config.featureGroups) {
        const featureGroup = new L.FeatureGroup(undefined, featureGroupConfig.options);
        for (const featureConfig of featureGroupConfig.features) {
          let feature: L.Rectangle|L.Circle|L.Polygon|L.Marker|undefined;

          switch (featureConfig.type) {
            case ('Rectangle'):
              feature = new L.Rectangle((featureConfig as LeafletRectangle).latLngBounds, featureConfig.options);
              break;
            case ('Circle'):
              feature = new L.Circle((featureConfig as LeafletCircle).latLng, featureConfig.options);
              break;
            case ('Polygon'):
              feature = new L.Polygon((featureConfig as LeafletPolygon).latLngs, featureConfig.options);
              break;
            case ('Marker'):
              feature = new L.Marker((featureConfig as LeafletMarker).latLng, featureConfig.options);
              break;
          }

          if (feature) {
            if (featureConfig.popupContent) {
              feature.bindPopup(featureConfig.popupContent);
            }
            featureGroup.addLayer(feature);
          }
        }
        this.map.addLayer(featureGroup);
      }
    }
  }

  addClusteredMarkerGroups() {
    if (this.config.markerClusterGroups) {
      for (const markerClusterGroupConfig of this.config.markerClusterGroups) {
        const markerClusterGroup = new (L.markerClusterGroup as any)(markerClusterGroupConfig.options) as L.MarkerClusterGroup;

        for (const markerConfig of markerClusterGroupConfig.markers) {
          const marker = L.marker(markerConfig.latLng);
          markerClusterGroup.addLayer(marker);
        }

        this.map.addLayer(markerClusterGroup);
      }
    }
  }

  async init() {
    this.addFeatureGroups();
    this.addClusteredMarkerGroups();
  }
}

export interface LeafletConfig {
  mapOptions: L.MapOptions;
  initialLatLng: L.LatLngExpression;
  initialZoom: number;
  featureGroups?: LeafletFeatureGroup[];
  markerClusterGroups?: LeafletMarkerClusterGroup[];
}

export interface LeafletFeatureGroup {
  features: LeafletFeature<L.InteractiveLayerOptions>[];
  options?: L.LayerOptions;
}

export interface LeafletMarkerClusterGroup {
  markers: LeafletMarker[];
  options?: L.MarkerClusterGroupOptions;
}

export interface LeafletFeature<T extends L.InteractiveLayerOptions> {
  type: 'Rectangle'|'Circle'|'Polygon'|'Marker';
  popupContent?: string;
  options?: T;
  [key: string]: any;
}

export interface LeafletRectangle extends LeafletFeature<L.PolylineOptions> {
  latLngBounds: L.LatLngBoundsExpression;
}

export interface LeafletCircle extends LeafletFeature<L.CircleMarkerOptions> {
  latLng: L.LatLngExpression;
}

export interface LeafletPolygon extends LeafletFeature<L.PolylineOptions> {
  latLngs: L.LatLngExpression[];
}

export interface LeafletMarker extends LeafletFeature<L.MarkerOptions> {
  latLng: [number, number];
}