import { TextBox } from "devextreme-react";
import React, { useCallback, useRef, useState } from "react";
import { API_KEY } from "./api-license";
import "./home.scss";

export default function Home() {
  const streetAddRef = useRef();
  const [value, setValue] = useState('');
  let location = {
	country: '',
	countryCode: '',
	postal_code: '',
	postal_code_suffix: '',
	locality: '',
	state: '',
	stateCode: '',
	address: '',
	route: '',
	street_number: '',
	fullAddress: ''
};

  const invokeEvent  = useCallback((place) => {
		setValue(place.formatted_address);
		location.fullAddress = place.formatted_address;

		for (const component of place.address_components) {
			const componentType = component.types[0];

			switch (componentType) {
				case 'subpremise': {
					location.unitNo = `${component.long_name}`;
					break;
				}
				case 'street_number': {
					location.street_number = `${component.long_name}`;
					break;
				}

				case 'route': {
					location.address += component.short_name;
					break;
				}

				case 'postal_code': {
					location.postal_code = component.long_name;
					break;
				}

				case 'postal_code_suffix': {
					location.postal_code_suffix = `${location.postal_code}-${component.long_name}`;
					break;
				}
				case 'locality':
					location.locality = component.short_name;
					break;
				case 'administrative_area_level_1': {
					location.state = component.long_name;
					location.stateCode = component.short_name;
					break;
				}
				case 'administrative_area_level_2': {
					location.administrative_area_level_2 = component.short_name;
					// location.locality = component.short_name;
					// TODO
					break;
				}
				case 'country':
					location.country = component.long_name;
					location.countryCode = component.short_name;
					break;
        
        default: break;
			}
		}

		location.locality = (location.locality || '').toUpperCase();

		console.log('After handle data: ', location);
	}, []);

  const initAutocomplete = useCallback(() => {
    const streetAddCurrent = streetAddRef.current;

    if (!streetAddCurrent) {
      return;
    }

    const GOOGLE_ADDRESS_API = window.google;
    // @ts-ignore
    const inputElement = streetAddCurrent.instance._input()[0];
    inputElement.placeholder = '';

    const autocomplete = new GOOGLE_ADDRESS_API.maps.places.Autocomplete(inputElement, {
      componentRestrictions: { country: ['AU'] },
      types: ['address'], // 'establishment' / 'address' / 'geocode'
      fields: ['address_components', 'formatted_address'], // 'geometry
    });
    
    GOOGLE_ADDRESS_API.maps.event.addListener(autocomplete, 'place_changed', () => {
      const place = autocomplete.getPlace();
      console.log('Raw data: ', place);
      invokeEvent(place);
    });
      
  }, []);


  const onContentReady = useCallback(() => {
    if(!streetAddRef.current) {
      return;
    }

    initAutocomplete();
  }, []);

  return (
    <React.Fragment>
        <TextBox label="Street Address"
          className="inline-control"
          onContentReady={onContentReady}
          ref={streetAddRef}>
        </TextBox>
    </React.Fragment>
  );
}
