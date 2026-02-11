package com.primepost.app

import android.content.Context
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent

class WebViewAuthNavigator(private val context: Context) {
    
    // Internet Identity domains that should open externally
    private val externalDomains = setOf(
        "identity.ic0.app",
        "identity.internetcomputer.org",
        "rdmx6-jaaaa-aaaaa-aaadq-cai.ic0.app",
        "rdmx6-jaaaa-aaaaa-aaadq-cai.raw.ic0.app"
    )

    // Deep link scheme for returning to the app
    private val returnScheme = "primepost"

    /**
     * Check if a URL should be opened in an external browser/custom tab
     */
    fun shouldOpenExternally(url: String): Boolean {
        return try {
            val uri = Uri.parse(url)
            val host = uri.host ?: return false
            externalDomains.any { host.contains(it, ignoreCase = true) }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Check if a URL is a return-to-app deep link
     */
    fun isReturnUrl(url: String): Boolean {
        return try {
            val uri = Uri.parse(url)
            uri.scheme == returnScheme
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Open a URL in a Chrome Custom Tab
     */
    fun openInCustomTab(url: String) {
        try {
            val builder = CustomTabsIntent.Builder()
            builder.setShowTitle(true)
            val customTabsIntent = builder.build()
            customTabsIntent.launchUrl(context, Uri.parse(url))
        } catch (e: Exception) {
            // Fallback to default browser if Custom Tabs not available
            val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, Uri.parse(url))
            context.startActivity(intent)
        }
    }
}
