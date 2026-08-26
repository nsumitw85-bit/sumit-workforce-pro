import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Download, Code, Layers, FileCode, FolderTree } from 'lucide-react';

interface AndroidSourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidSourceCodeModal: React.FC<AndroidSourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string>('');
  const [activeFile, setActiveFile] = useState<string>('MainActivity');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const ANDROID_FILES: { [key: string]: { path: string; language: string; content: string } } = {
    'MainActivity': {
      path: 'app/src/main/java/com/sumitworkforcepro/app/MainActivity.kt',
      language: 'kotlin',
      content: `package com.sumitworkforcepro.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.sumitworkforcepro.app.ui.navigation.AppNavigation
import com.sumitworkforcepro.app.ui.theme.SumitWorkforceProTheme
import com.sumitworkforcepro.app.viewmodel.WorkforceViewModel

/**
 * Sumit Workforce Pro - Smart Attendance & Workforce Management
 * Target Android SDK: 36 (Android 16 Ready)
 * Architecture: MVVM + Room Database + Jetpack Compose Material 3
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SumitWorkforceProTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val viewModel: WorkforceViewModel = viewModel()
                    AppNavigation(viewModel = viewModel)
                }
            }
        }
    }
}`
    },

    'RoomEntities': {
      path: 'app/src/main/java/com/sumitworkforcepro/app/data/model/Entities.kt',
      language: 'kotlin',
      content: `package com.sumitworkforcepro.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

enum class AttendanceStatus {
    PRESENT, ABSENT, HALF_DAY, LEAVE
}

@Entity(tableName = "employees")
data class EmployeeEntity(
    @PrimaryKey val id: String, // e.g. "SWP-101"
    val name: String,
    val mobile: String,
    val email: String? = null,
    val department: String,
    val designation: String,
    val address: String,
    val joiningDate: String,
    val dailySalary: Double,
    val monthlySalary: Double,
    val photoUri: String? = null,
    val status: String = "ACTIVE",
    val bankAccount: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "attendance_records")
data class AttendanceEntity(
    @PrimaryKey val id: String, // "\${employeeId}_\${date}"
    val employeeId: String,
    val date: String, // "YYYY-MM-DD"
    val status: AttendanceStatus,
    val inTime: String? = null,
    val outTime: String? = null,
    val overtimeHours: Double = 0.0,
    val notes: String? = null,
    val markedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "company_settings")
data class CompanySettingsEntity(
    @PrimaryKey val id: Int = 1,
    val companyName: String = "Sumit Enterprises",
    val companyTagline: String = "Smart Attendance & Workforce Management",
    val companyAddress: String = "Bangalore, India",
    val companyPhone: String = "+91 9876543210",
    val companyEmail: String = "admin@sumitworkforce.pro",
    val currencySymbol: String = "₹",
    val standardWorkDays: Int = 26,
    val halfDayRate: Double = 0.5,
    val appLockEnabled: Boolean = false,
    val pinCode: String = "1234",
    val authorizedSignatory: String = "Sumit Sharma (Director)"
)`
    },

    'RoomDao': {
      path: 'app/src/main/java/com/sumitworkforcepro/app/data/dao/WorkforceDao.kt',
      language: 'kotlin',
      content: `package com.sumitworkforcepro.app.data.dao

import androidx.room.*
import com.sumitworkforcepro.app.data.model.AttendanceEntity
import com.sumitworkforcepro.app.data.model.CompanySettingsEntity
import com.sumitworkforcepro.app.data.model.EmployeeEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkforceDao {
    // Employee Queries
    @Query("SELECT * FROM employees ORDER BY name ASC")
    fun getAllEmployees(): Flow<List<EmployeeEntity>>

    @Query("SELECT * FROM employees WHERE id = :empId LIMIT 1")
    suspend fun getEmployeeById(empId: String): EmployeeEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEmployee(employee: EmployeeEntity)

    @Delete
    suspend fun deleteEmployee(employee: EmployeeEntity)

    // Attendance Queries
    @Query("SELECT * FROM attendance_records WHERE date = :date")
    fun getAttendanceForDate(date: String): Flow<List<AttendanceEntity>>

    @Query("SELECT * FROM attendance_records WHERE employeeId = :empId ORDER BY date DESC")
    fun getAttendanceForEmployee(empId: String): Flow<List<AttendanceEntity>>

    @Query("SELECT * FROM attendance_records WHERE date LIKE :monthPrefix || '%'")
    fun getAttendanceForMonth(monthPrefix: String): Flow<List<AttendanceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendance(record: AttendanceEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllAttendance(records: List<AttendanceEntity>)

    // Settings
    @Query("SELECT * FROM company_settings WHERE id = 1 LIMIT 1")
    fun getSettings(): Flow<CompanySettingsEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun updateSettings(settings: CompanySettingsEntity)
}`
    },

    'PdfAndShareService': {
      path: 'app/src/main/java/com/sumitworkforcepro/app/util/PdfGenerator.kt',
      language: 'kotlin',
      content: `package com.sumitworkforcepro.app.util

import android.content.Context
import android.content.Intent
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import com.sumitworkforcepro.app.data.model.AttendanceEntity
import com.sumitworkforcepro.app.data.model.CompanySettingsEntity
import com.sumitworkforcepro.app.data.model.EmployeeEntity
import java.io.File
import java.io.FileOutputStream

object PdfAndShareService {

    /**
     * Generate A4 Daily Attendance PDF using native Android PdfDocument API
     */
    fun generateDailyAttendancePdf(
        context: Context,
        date: String,
        employees: List<EmployeeEntity>,
        attendance: List<AttendanceEntity>,
        settings: CompanySettingsEntity
    ): File {
        val document = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4 at 72 DPI
        val page = document.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val paint = Paint()
        // Header Banner
        paint.color = Color.rgb(15, 23, 42) // Slate 900
        canvas.drawRect(0f, 0f, 595f, 70f, paint)

        // Accent Green Bar
        paint.color = Color.rgb(16, 185, 129) // Emerald 500
        canvas.drawRect(0f, 70f, 595f, 74f, paint)

        // Header Text
        paint.color = Color.WHITE
        paint.textSize = 18f
        paint.isFakeBoldText = true
        canvas.drawText(settings.companyName, 20f, 35f, paint)

        paint.textSize = 10f
        paint.isFakeBoldText = false
        paint.color = Color.LTGRAY
        canvas.drawText("\${settings.companyTagline} | Tel: \${settings.companyPhone}", 20f, 55f, paint)

        // Report Title
        paint.color = Color.BLACK
        paint.textSize = 14f
        paint.isFakeBoldText = true
        canvas.drawText("DAILY ATTENDANCE REPORT - \$date", 20f, 100f, paint)

        document.finishPage(page)

        val outputDir = File(context.cacheDir, "reports")
        if (!outputDir.exists()) outputDir.mkdirs()
        val file = File(outputDir, "Attendance_\${date}.pdf")
        val fos = FileOutputStream(file)
        document.writeTo(fos)
        document.close()
        fos.close()

        return file
    }

    /**
     * Share PDF file directly to WhatsApp or Android Intent
     */
    fun sharePdfToWhatsApp(context: Context, pdfFile: File, title: String, message: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "\${context.packageName}.fileprovider",
            pdfFile
        )

        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_TEXT, message)
            putExtra(Intent.EXTRA_SUBJECT, title)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            setPackage("com.whatsapp") // Direct WhatsApp target
        }

        try {
            context.startActivity(intent)
        } catch (e: Exception) {
            // Fallback to Android Share Sheet
            val chooser = Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                type = "application/pdf"
                putExtra(Intent.EXTRA_STREAM, uri)
                putExtra(Intent.EXTRA_TEXT, message)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }, "Share Report via...")
            context.startActivity(chooser)
        }
    }
}`
    },

    'AndroidManifest': {
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="Sumit Workforce Pro"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SumitWorkforcePro">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.SumitWorkforcePro">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- FileProvider for secure WhatsApp PDF Sharing -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="com.sumitworkforcepro.app.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>`
    },

    'BuildGradle': {
      path: 'app/build.gradle.kts',
      language: 'kotlin',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.sumitworkforcepro.app"
    compileSdk = 36 // Android SDK 36 Ready

    defaultConfig {
        applicationId = "com.sumitworkforcepro.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "2.4.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Pre-configured signing
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Biometric Authentication
    implementation(libs.androidx.biometric)
}`
    }
  };

  const active = ANDROID_FILES[activeFile];

  return (
    <div
      id="android-source-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fade-in"
    >
      <div className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Android Studio Native Architecture</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  SDK 36 • Kotlin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Package: <code className="font-mono text-emerald-400">com.sumitworkforcepro.app</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          {Object.keys(ANDROID_FILES).map((key) => (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeFile === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{key}</span>
            </button>
          ))}
        </div>

        {/* File Path & Copy Action */}
        <div className="px-6 py-2 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 font-mono">
          <span className="truncate">{active.path}</span>
          <button
            onClick={() => copyToClipboard(active.content, activeFile)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-all"
          >
            {copiedKey === activeFile ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Viewer Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-950 font-mono text-xs text-emerald-300 leading-relaxed max-h-[480px]">
          <pre className="whitespace-pre-wrap">{active.content}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Jetpack Compose Material 3 • Room Database • FileProvider Sharing
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
