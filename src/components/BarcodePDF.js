import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Improved color palette and styling
const COLORS = {
    primary: "#94152b",
    secondary: "#f4f4f4",
    text: "#333",
    border: "#cccccc"
};

// Enhanced styles with more responsive and modern design
const styles = StyleSheet.create({
    page: { 
        padding: 30, 
        fontSize: 12,
        fontFamily: "Helvetica",
        backgroundColor: COLORS.secondary 
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    title: { 
        fontSize: 22, 
        color: COLORS.primary,
        fontWeight: "bold",
        textAlign: "left" 
    },
    date: {
        fontSize: 10,
        color: COLORS.text
    },
    table: { 
        display: "table", 
        width: "100%", 
        borderStyle: "solid", 
        borderWidth: 1, 
        borderColor: COLORS.border,
        borderRadius: 5 
    },
    tableRow: { 
        flexDirection: "row", 
        borderBottomWidth: 1, 
        borderColor: COLORS.border, 
        borderStyle: "solid",
        backgroundColor: "white"
    },
    tableHeader: { 
        backgroundColor: COLORS.primary, 
        color: "white",
        fontWeight: "bold"
    },
    tableColHeader: { 
        width: "50%", 
        padding: 8, 
        textAlign: "center",
        borderRightWidth: 1,
        borderRightColor: "rgba(255,255,255,0.2)"
    },
    tableCol: { 
        width: "50%", 
        padding: 8,
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center"
    },
    resourceTitle: {
        fontSize: 10,
        color: COLORS.text
    },
    image: { 
        width: 120, 
        height: 60, 
        objectFit: "contain" 
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 30,
        right: 30,
        fontSize: 8,
        textAlign: "center",
        color: COLORS.text
    }
});

const BarcodePDF = ({ selectedResources }) => {
    // Get current date for footer
    const currentDate = new Date().toLocaleDateString();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Enhanced Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Learning Resources Center CLA</Text>
                    <Text style={styles.date}>Generated: {currentDate}</Text>
                </View>

                {/* Subtitle */}
                <Text style={[styles.resourceTitle, { textAlign: "center", marginBottom: 10 }]}>
                    Resource Barcode Report
                </Text>
                
                {/* Table */}
                <View style={styles.table}>
                    {/* Table Header */}
                    <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableColHeader, styles.tableHeader]}>Resource Title</Text>
                        <Text style={[styles.tableColHeader, styles.tableHeader]}>Barcode</Text>
                    </View>

                    {/* Table Data */}
                    {selectedResources.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCol}>
                                <Text style={styles.resourceTitle}>{item.resource_title}</Text>
                            </Text>
                            <View style={styles.tableCol}>
                                <Image
                                    style={styles.image}
                                    src={item.isbn&&item.isbn.length>0 
                                        ? `https://barcodeapi.org/api/128/${item.isbn}` 
                                        : `https://barcodeapi.org/api/128/${item.resource_id}`
                                    }
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    © {new Date().getFullYear()} Learning Resources Center - Confidential
                </Text>
            </Page>
        </Document>
    );
};

export default BarcodePDF;