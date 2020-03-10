/* 
Monark Basak
1056289
mbasak@uoguelph.ca
CIS2750 - Assignment 1 & 2
*/
#ifndef EXTRA_FUNCTIONS_H
#define EXTRA_FUNCTIONS_H

#include <math.h>
#include <ctype.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>
#include <libxml/parser.h>
#include <libxml/tree.h>
#include <libxml/encoding.h>
#include <libxml/xmlwriter.h>
#include <libxml/xmlschemastypes.h>
#include "LinkedListAPI.h"

#define PI 3.14159265359

bool areRectsInvalid(List *imageRects);
bool areCirclesInvalid(List *imageCircles);
bool arePathsInvalid(List *imagePaths);
bool isSVGInvalid(SVGimage *image);
bool areGroupsInvalid(List *imageGroups);

void getCirclesInGroups(List *allCircles, List *listOfGroups);
void getGroupsInGroups(List *allGroups, List *listOfGroups);
void getPathsInGroups(List *allPaths, List *listOfGroups);
void getRectsInGroups(List *allRects, List *listOfGroups);

// A3 Functions START

char *getJSONofSVG (char *file);
char *getJSONforViewPanel (char *file);
char *getJSONforOtherAttr(char *file, char *elementType, int elemIndex);
char *updateTitleOfSVG(char *file, char *newTitle);
char *updateDescOfSVG(char *file, char *newDesc);
char *updateOtherAttribute(char *file, char *elemType, int elementIndex, char *newOtherAttr, char *newOtherAttrVal);
char *updateElementAttribute(char *file, char *elemType, int elementIndex, char *newAttr, char *newAttrVal);
char *validateSVGforServer(char *file);

// A3 Functions END

void fillInValues(elementType elemType, void *element, char *key, char *value);
void updateGroupAttr(SVGimage *image, Attribute *newAttr, int elemIndex);
void updatePathAttr(SVGimage *image, Attribute *newAttr, int elemIndex);
void updateRectAttr(SVGimage *image, Attribute *newAttr, int elemIndex);
void updateCircleAttr(SVGimage *image, Attribute *newAttr, int elemIndex);
void updateSVGAttr(SVGimage *image, Attribute *newAttr);
void updateOtherAttr(List *listOfOtherAttr, Attribute *newAttr);
bool areOtherAttrValid(List *list);
bool areListsValid(SVGimage *image);
bool areNumsValid(SVGimage *image);
bool arePathsValid(SVGimage *image);
bool areSVGNonListValid(SVGimage *image);
bool imageViolatesConstraints(SVGimage *image);
bool validateImage(SVGimage *image, char *schemafile);
void setupDoc(SVGimage *image, xmlNode **root_node, xmlDoc **doc);
void attrToDoc(List *listToTraverse, xmlNode *parentNode);
void groupToDoc(List *listToTraverse, xmlNode *parentNode);
void pathToDoc(List *listToTraverse, xmlNode *parentNode);
void circleToDoc(List *listToTraverse, xmlNode *parentNode);
void rectToDoc(List *listToTraverse, xmlNode *parentNode);
bool validateXmlDoc(char *schemafile, xmlDoc *doc);
void dummyDelete(void *data);
void freeListNotData(List *list); // Needed for my get functions
void addOtherAttributes(xmlAttr *attr, List *listOfElements, char *parentOfAttr);
void parseSVG(xmlNode *aNode, SVGimage *image);
void parsePaths(xmlNode *aNode, Path *currPathElement);
void unitParser(char *storeUnits, char *searchForUnits);
void parseCircles(xmlNode *aNode, Circle *currCircleElement);
void parseRectangles(xmlNode *aNode, Rectangle *currRectElement);
void parseGroups(xmlNode *aNode, Group *currGroupElement);

#endif