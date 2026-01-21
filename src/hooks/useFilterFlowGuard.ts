import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FILTER_FLOW_KEY = 'filter_flow_active';
const FILTER_PATHS = [
  '/filter/gender',
  '/filter/ethnicity',
  '/filter/skin-tone',
  '/filter/hair-color',
  '/filter/eye-color',
  '/filter/body-type',
  '/filter/hair-type',
  '/filter/beard-type',
  '/filter/modest-option',
  '/filter/pose',
  '/filter/background',
  '/filter/face-type',
  '/filter/expression',
  '/clothing',
];

/**
 * Hook to guard filter flow pages.
 * On page refresh (not navigation), redirects to Gender Selection.
 * Call this at the start of each filter page component.
 */
export function useFilterFlowGuard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const isFilterPage = FILTER_PATHS.some(path => location.pathname === path);
    
    if (!isFilterPage) return;

    // Check if we're in an active filter flow
    const isFlowActive = sessionStorage.getItem(FILTER_FLOW_KEY) === 'true';

    if (!isFlowActive) {
      // This is a refresh or direct URL access - redirect to gender selection
      if (location.pathname !== '/filter/gender') {
        navigate('/filter/gender', { replace: true });
      }
    }
  }, [location.pathname, navigate]);
}

/**
 * Mark the filter flow as active. Call this when starting the flow.
 */
export function startFilterFlow() {
  sessionStorage.setItem(FILTER_FLOW_KEY, 'true');
}

/**
 * Clear the filter flow state. Call this when completing or exiting the flow.
 */
export function endFilterFlow() {
  sessionStorage.removeItem(FILTER_FLOW_KEY);
}
