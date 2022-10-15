import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AccountActions from './account.actions';
import { IAccount } from '../../model/accounts.model';
import { AccountsService } from '../../services/accounts.service';
import { AppsService, UsersService } from 'src/app/services';
import { IApp } from 'src/app/model/apps.model';
import { IUser } from 'src/app/model/users.model';

@Injectable()
export class AccountEffects {
  loadAccountList$: Observable<{ results: IAccount[] } | { error: any }> =
    createEffect(() => {
      return this.actions$.pipe(
        ofType('[Accounts Page] Load Account List'),
        mergeMap(() => {
          // TODO Page block should be dynamic
          return this.accountsService.getList(0, 50).pipe(
            // TODO Join some data from other collections (parent app icon, user name resolve)
            map((accounts: any) => {
              // Retrieve all apps
              let currentApps: IApp[];
              const allApps = this.appsService.getAll();
              allApps.subscribe((apps: IApp[]) => (currentApps = apps));

              // Retrieve all users
              let currentUsers: IUser[];
              const allUsers = this.userService.getAll();
              allUsers.subscribe((users: IUser[]) => (currentUsers = users));

              // Set app and user properties
              accounts.forEach((account: IAccount) => {
                account.app = currentApps.filter(
                  (app: IApp) => app.id == account.app_id
                )[0];
                account.user = currentUsers.filter(
                  (user: IUser) => user.id == account.user_id
                )[0];
              });

              return AccountActions.loadAccountListSuccess({
                results: accounts,
              });
            }),
            catchError((error) => {
              return of(AccountActions.loadAccountListFailure({ error }));
            })
          );
        })
      );
    });

  constructor(
    private actions$: Actions,
    private appsService: AppsService,
    private userService: UsersService,
    private accountsService: AccountsService
  ) {}
}
