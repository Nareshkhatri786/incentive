<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\EmployeeLedgerController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::post('/projects/{project}/rules', [ProjectController::class, 'addRule'])->name('projects.rules.store');
    Route::put('/rules/{rule}', [ProjectController::class, 'updateRule'])->name('projects.rules.update');
    Route::post('/rules/{rule}/toggle', [ProjectController::class, 'toggleRuleStatus'])->name('projects.rules.toggle');
    Route::delete('/rules/{rule}', [ProjectController::class, 'destroyRule'])->name('projects.rules.destroy');

    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');

    Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/bookings/{booking}/status', [BookingController::class, 'updateStatus'])->name('bookings.status.update');

    Route::get('/collections', [CollectionController::class, 'index'])->name('collections.index');
    Route::post('/collections', [CollectionController::class, 'store'])->name('collections.store');

    Route::get('/payroll', [EmployeeLedgerController::class, 'index'])->name('payroll.index');
    Route::post('/payroll/advance', [EmployeeLedgerController::class, 'giveAdvance'])->name('payroll.advance');
    Route::post('/payroll/salary-adjust', [EmployeeLedgerController::class, 'salaryAdjustment'])->name('payroll.salary.adjust');
    Route::post('/payroll/incentive/{ledger}/pay', [EmployeeLedgerController::class, 'markIncentivePaid'])->name('payroll.incentive.pay');

    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
});
