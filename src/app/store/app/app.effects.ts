import { Injectable } from '@angular/core';
import { AppsService, AccountsService } from '../../services/';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { IApp } from '../../model/apps.model';
import * as AppActions from './app.actions';
import { IAccount } from 'src/app/model/accounts.model';

@Injectable()
export class AppEffects {
  loadAppList$: Observable<{ results: IApp[] } | { error: any }> = createEffect(
    () => {
      return this.actions$.pipe(
        ofType('[Apps Page] Load App List'),
        mergeMap(() => {
          // TODO Page block should be dynamic

          return this.appsService.getList(0, 50).pipe(
            // TODO Join some data from other collections (app account counter)
            map((apps: IApp[]) => {
              // Retrieve all accounts
              let currentAccounts: IAccount[];
              const test = this.accountsService.getAll();
              test.subscribe(
                (accounts: IAccount[]) => (currentAccounts = accounts)
              );

              // Set app account counter
              apps.forEach((app: IApp) => {
                app.accounts = currentAccounts.filter(
                  (acc: IAccount) => acc.app_id == app.id
                ).length;
              });

              return AppActions.loadAppListSuccess({ results: apps });
            }),
            catchError((error: any) => {
              return of(AppActions.loadAppListFailure({ error }));
            })
          );
        })
      );
    }
  );

  constructor(
    private actions$: Actions,
    private appsService: AppsService,
    private accountsService: AccountsService
  ) {}
}
