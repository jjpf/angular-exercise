import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
import { IUser } from '../../model/users.model';
import { UsersService } from '../../services/users.service';
import { AccountsService, AppsService } from 'src/app/services';
import { IApp } from 'src/app/model/apps.model';
import { IAccount } from 'src/app/model/accounts.model';
import { selectAppsState } from '../app/app.selectors';
import { Store } from '@ngrx/store';

@Injectable()
export class UserEffects {
  loadUserList$: Observable<{ results: IUser[] } | { error: any }> =
    createEffect(() => {
      return this.actions$.pipe(
        ofType('[Users Page] Load User List'),
        mergeMap(() => {
          // TODO Page block should be dynamic
          return this.usersService.getList(0, 50).pipe(
            // TODO Join some data from other collections (each user apps)
            map((users: any) => {
              // Retrieve all accounts
              let currentAccounts: IAccount[];
              const allAccounts = this.accountsService.getAll();
              allAccounts.subscribe(
                (accounts: IAccount[]) => (currentAccounts = accounts)
              );
              // Better to use selectors?
              const appsState: any = selectAppsState(this.store);
              console.log(appsState);
              // Set apps
              users.forEach((user: IUser) => {
                user.apps = currentAccounts.flatMap((account: IAccount) => {
                  const userApps: IApp[] = [];
                  if (account.user_id == user.id) {
                    userApps.push(account.app);
                  }
                  return userApps;
                });
              });

              console.log(users);
              return UserActions.loadUserListSuccess({ results: users });
            }),
            catchError((error) => {
              return of(UserActions.loadUserListFailure({ error }));
            })
          );
        })
      );
    });

  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private accountsService: AccountsService,
    private store: Store
  ) {}
}
