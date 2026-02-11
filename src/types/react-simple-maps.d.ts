declare module "react-simple-maps" {
  import * as React from "react";

  export interface ComposableMapProps {
    width?: number;
    height?: number;
    projection?: string | ((width: number, height: number, config: any) => any);
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      parallels?: [number, number];
      precision?: number;
    };
    style?: React.CSSProperties;
    children?: React.ReactNode;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface GeographiesProps {
    geography?: string | Record<string, any> | string[];
    children?: (args: { geographies: any[] }) => React.ReactNode;
    parseGeographies?: (geographies: any[]) => any[];
  }

  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps {
    geography?: any;
    key?: string | number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number | string;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    title?: string;
    onClick?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseEnter?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseLeave?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseDown?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onMouseUp?: (event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
    onFocus?: (event: React.FocusEvent<SVGPathElement>) => void;
    onBlur?: (event: React.FocusEvent<SVGPathElement>) => void;
  }

  export const Geography: React.FC<GeographyProps>;
  
  export const Marker: React.FC<any>;
  export const Annotation: React.FC<any>;
  export const Line: React.FC<any>;
}