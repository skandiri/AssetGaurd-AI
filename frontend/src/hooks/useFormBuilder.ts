import { useReducer, useCallback } from 'react';
import type { FormBuilderState, FormBuilderAction, FormTemplate, FormField } from '../types/formBuilderTypes';

const initialState: FormBuilderState = {
  formName: '',
  formDescription: '',
  fields: [],
  selectedFieldId: null,
  isDirty: false,
  isSaving: false,
  error: null
};

export const formBuilderReducer = (
  state: FormBuilderState,
  action: FormBuilderAction
): FormBuilderState => {
  switch (action.type) {
    case 'SET_FORM_NAME':
      return { ...state, formName: action.payload, isDirty: true };

    case 'SET_FORM_DESCRIPTION':
      return { ...state, formDescription: action.payload, isDirty: true };

    case 'ADD_FIELD': {
      const newFields = [...state.fields, action.payload];
      // Update order for all fields
      newFields.forEach((field, index) => {
        field.order = index;
      });
      return {
        ...state,
        fields: newFields,
        isDirty: true
      };
    }

    case 'UPDATE_FIELD':
      return {
        ...state,
        fields: state.fields.map(field =>
          field.id === action.payload.id ? action.payload : field
        ),
        isDirty: true
      };

    case 'DELETE_FIELD': {
      const newFields = state.fields.filter(field => field.id !== action.payload);
      // Update order for remaining fields
      newFields.forEach((field, index) => {
        field.order = index;
      });
      return {
        ...state,
        fields: newFields,
        selectedFieldId:
          state.selectedFieldId === action.payload ? null : state.selectedFieldId,
        isDirty: true
      };
    }

    case 'REORDER_FIELDS': {
      return {
        ...state,
        fields: action.payload.map((field, index) => ({
          ...field,
          order: index
        })),
        isDirty: true
      };
    }

    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };

    case 'LOAD_FORM':
      return {
        ...state,
        formName: action.payload.name,
        formDescription: action.payload.description || '',
        fields: action.payload.fields,
        isDirty: false
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

export const useFormBuilder = () => {
  const [state, dispatch] = useReducer(formBuilderReducer, initialState);

  const setFormName = useCallback((name: string) => {
    dispatch({ type: 'SET_FORM_NAME', payload: name });
  }, []);

  const setFormDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_FORM_DESCRIPTION', payload: description });
  }, []);

  const addField = useCallback((field: FormField) => {
    dispatch({ type: 'ADD_FIELD', payload: field });
  }, []);

  const updateField = useCallback((field: FormField) => {
    dispatch({ type: 'UPDATE_FIELD', payload: field });
  }, []);

  const deleteField = useCallback((fieldId: string) => {
    dispatch({ type: 'DELETE_FIELD', payload: fieldId });
  }, []);

  const reorderFields = useCallback((fields: FormField[]) => {
    dispatch({ type: 'REORDER_FIELDS', payload: fields });
  }, []);

  const selectField = useCallback((fieldId: string | null) => {
    dispatch({ type: 'SELECT_FIELD', payload: fieldId });
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    dispatch({ type: 'SET_SAVING', payload: saving });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setDirty = useCallback((dirty: boolean) => {
    dispatch({ type: 'SET_DIRTY', payload: dirty });
  }, []);

  const loadForm = useCallback((form: FormTemplate) => {
    dispatch({ type: 'LOAD_FORM', payload: form });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    setFormName,
    setFormDescription,
    addField,
    updateField,
    deleteField,
    reorderFields,
    selectField,
    setSaving,
    setError,
    setDirty,
    loadForm,
    reset
  };
};
