import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AssetFormComponent } from '../../features/asset-form/asset-form';

export const unsavedChangesGuard: CanDeactivateFn<AssetFormComponent> = (component) => {
  if (component.form?.dirty && !component.isSubmitting) {
    return component.openUnsavedModal();
  }
  return true;
};