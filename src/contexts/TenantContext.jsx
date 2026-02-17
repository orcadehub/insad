import { createContext, useContext, useState } from 'react';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [selectedTenant, setSelectedTenant] = useState(() => {
    const saved = localStorage.getItem('selectedTenant');
    return saved ? JSON.parse(saved) : null;
  });
  const [tenants, setTenants] = useState([]);

  const clearSelectedTenant = () => {
    setSelectedTenant(null);
    localStorage.removeItem('selectedTenant');
  };

  const setSelectedTenantWithStorage = (tenant) => {
    setSelectedTenant(tenant);
    if (tenant) {
      localStorage.setItem('selectedTenant', JSON.stringify(tenant));
    } else {
      localStorage.removeItem('selectedTenant');
    }
  };

  const value = {
    selectedTenant,
    setSelectedTenant: setSelectedTenantWithStorage,
    tenants,
    setTenants,
    clearSelectedTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};