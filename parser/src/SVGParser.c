/* 
Monark Basak
1056289
mbasak@uoguelph.ca
CIS2750 - Assignment 1 & 2
*/

/* All parse helper functions contain some sample code from xmlExample.c provided to us by Prof. Nikintenko. */
/* Also contains code from http://www.xmlsoft.org/html/libxmltree.html and http://www.xmlsoft.org/html/libxmlxmlschemastypes.html */

#include <stdlib.h>
#include "SVGParser.h"
#include "additionalFunctions.h"

SVGimage* createSVGimage(char *filename)
{    
    SVGimage *image = NULL;
    xmlDoc *doc = NULL;
    xmlNode *root_node = NULL;

    if (filename == NULL) {
        // printf("error: filename doesn't exist\n");
        return NULL;
    } 

    if (strcmp("", filename) == 0) { // If filename is empty
        // printf("error: no filename\n");
        return NULL;
    } 
    
    doc = xmlReadFile(filename, NULL, 0);
    if (doc == NULL) return NULL;

    root_node = xmlDocGetRootElement(doc);
    if (root_node == NULL) {
        if (doc != NULL) xmlFreeDoc(doc);
        return NULL;
    }

    image = (SVGimage *)calloc(1, sizeof(SVGimage));
    image->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);
    image->paths = initializeList(pathToString, deletePath, comparePaths);
    image->circles = initializeList(circleToString, deleteCircle, compareCircles);
    image->rectangles = initializeList(rectangleToString, deleteRectangle, compareRectangles);
    image->groups = initializeList(groupToString, deleteGroup, compareGroups);

    parseSVG(root_node, image);
    
    xmlFreeDoc(doc);
    xmlCleanupParser();

    return image; // Returns pointer to SVG object
}

char* SVGimageToString(SVGimage* image)
{   

    if (image == NULL) return "";

    // printf("SVGimageToString func\n");
    char *output = (char *)calloc(1000000, sizeof(char)); // Might have to change this
    
    sprintf(output, "\n\n\n~~~~SVG~~~~\nNamespace: %s\n", image->namespace);
    
    // strcat(output, );
    if (strlen(image->title) > 0) {
        strcat(output, "Title: ");
        strcat(output, image->title);
        strcat(output, "\n");
    }

    strcat(output, "Description: ");
    strcat(output, image->description);
    strcat(output, "\n");
    // output = strdup("Title: %s\n", image->title); // Use this if I want 1100+ errors
    // strcpy(output, image->namespace);
    // strcat(output, "\n");

    char *tmp = toString(image->otherAttributes);
    // strcat(output, toString(image->otherAttributes));
    strcat(output, tmp);

    /* PATH */
    free(tmp);
    strcat(output, "\n~~~PATH~~~\n");
    tmp = toString(image->paths);
    strcat(output, tmp);
    if(strlen(tmp) == 0) strcat(output, "NONE\n");

    /* CIRCLES */
    free(tmp);
    strcat(output, "\n~~~CIRCLE~~~\n");
    tmp = toString(image->circles);
    strcat(output, tmp);
    if(strlen(tmp) == 0) strcat(output, "NONE\n");

    /* RECTANGLES */
    free(tmp);
    strcat(output, "\n~~~RECTANGLES~~~\n");
    tmp = toString(image->rectangles);
    strcat(output, tmp);
    if(strlen(tmp) == 0) strcat(output, "NONE\n");

    /* GROUPS */
    free(tmp);
    strcat(output, "\n~~~GROUPS~~~\n");
    tmp = toString(image->groups);
    strcat(output, tmp);
    if(strlen(tmp) == 0) strcat(output, "NONE\n");
    strcat(output, "\n~~~END OF GROUPS~~~\n");

    output = realloc(output, sizeof(char) * (strlen(output) + 1));
    // output[strlen(output)] = '\0';

    free(tmp); // Need to free the string returned by toString

    return output;
}

void deleteSVGimage(SVGimage* image)
{
    /* Free rectangles, paths, and circles */
    if (image == NULL) return;

    if (image->otherAttributes != NULL) freeList(image->otherAttributes);
    if (image->paths != NULL) freeList(image->paths);
    if (image->circles != NULL) freeList(image->circles);
    if (image->rectangles != NULL) freeList(image->rectangles);
    if (image->groups != NULL) freeList(image->groups);

    free(image);
    image = NULL;

    /* Frees global variables that might have been allocated by the XMLlib */
    xmlCleanupParser();
}


// SVG attributes
void deleteAttribute( void* data)
{
    // Check if data exists
    if (data == NULL) return;

    Attribute *attrToDel = (Attribute *)data;
    /* if (attrToDel->name != NULL)  */free(attrToDel->name);
    /* if (attrToDel->value != NULL)  */free(attrToDel->value);
    /* if (attrToDel != NULL)  */free(attrToDel);
}

char* attributeToString( void* data)
{
    if (data == NULL) return "";

    Attribute *attrData = (Attribute *)data;
    char *output = (char *)calloc(10000, sizeof(char));

    sprintf(output, "Attribute name: %s\tAttribute value: %s\n", attrData->name, attrData->value);
    // printf("STRLEN: %ld\n", strlen("Attribute name: \tAttribute value: \n"));

    output = realloc(output, sizeof(char) * (strlen(output) + 1));

    return output;
}

int compareAttributes(const void *first, const void *second)
{
    if (first == NULL || second == NULL) return -1;

    Attribute *attrNode1 = (Attribute *)first;
    Attribute *attrNode2 = (Attribute *)second;

    return attrNode1 - attrNode2;
}


// Rectangles
void deleteRectangle(void* data)
{
    if (data == NULL) return;

    Rectangle *rectToDel = (Rectangle *)data;

    freeList(rectToDel->otherAttributes);
    free(rectToDel);
}

char* rectangleToString(void* data)
{
    if (data == NULL) return "";

    Rectangle *rectData = (Rectangle *)data;
    char *output = (char *)calloc(10000, sizeof(char));

    char *tmp = toString(rectData->otherAttributes);
    sprintf(output, "X: %f Y: %f WIDTH: %f HEIGHT: %f UNITS: %s\n%s\n", rectData->x, rectData->y, rectData->width, rectData->height, rectData->units, tmp);

    output = realloc(output, sizeof(char) * (strlen(output) + 1));
    free(tmp);

    return output;
}

int compareRectangles(const void *first, const void *second)
{
    return 0;
}


// Circles
void deleteCircle(void* data)
{
    if (data == NULL) return;

    Circle *circleToDel = (Circle *)data;

    freeList(circleToDel->otherAttributes);
    free(circleToDel);
}

char* circleToString(void* data)
{
    if (data == NULL) return "";

    Circle *circleData = (Circle *)data;
    char *output = (char *)calloc(10000, sizeof(char));

    char *tmp = toString(circleData->otherAttributes);
    sprintf(output, "CX: %f CY: %f R: %f UNITS: %s\n%s\n", circleData->cx, circleData->cy, circleData->r, circleData->units, tmp);

    output = realloc(output, sizeof(char) * (strlen(output) + 1));
    free(tmp);

    return output;
}

int compareCircles(const void *first, const void *second)
{
    return 0;
}


// Paths
void deletePath(void* data)
{
    if (data == NULL) return;

    Path *pathToDel = (Path *)data;

    free(pathToDel->data);
    freeList(pathToDel->otherAttributes);

    free(pathToDel);
}

char* pathToString(void* data)
{
    if (data == NULL) return "";

    Path *pathData = (Path *)data;
    char *output = (char *)calloc(10000, sizeof(char));

    char *tmp = toString(pathData->otherAttributes);
    sprintf(output, "Data: %s\n%s\n", pathData->data, tmp);

    output = realloc(output, sizeof(char) * (strlen(output) + 1));
    free(tmp);

    return output;
}

int comparePaths(const void *first, const void *second)
{
    return 0;
}


// Groups
void deleteGroup(void* data)
{
    Group *groupToDel = (Group *)data;

    freeList(groupToDel->rectangles);
    freeList(groupToDel->circles);
    freeList(groupToDel->paths);
    freeList(groupToDel->otherAttributes);
    freeList(groupToDel->groups);

    free(groupToDel);
}

char* groupToString( void* data)
{
    if (data == NULL) return "";

    Group *groupData = (Group *)data;
    char *output = (char *)calloc(100000, sizeof(char));
    
    char *groupRects = toString(groupData->rectangles);
    char *groupCircles = toString(groupData->circles);
    char *groupPaths = toString(groupData->paths);
    char *groupGroups = toString(groupData->groups);
    char *otherAttr = toString(groupData->otherAttributes);

    sprintf(output, "~~~Rectangles in this Group~~~\n%s\n~~~Circles in this Group~~~\n%s\n~~~Paths in this Group~~~\n%s\n~~~Other Attributes~~~\n%s\n~~~Other Groups in this Group~~~\n%s\n", groupRects, groupCircles, groupPaths, otherAttr, groupGroups);

    // printf("\nPRINTING Length of list: %d\nother attributes in groups: %s\n\n", getLength(groupData->otherAttributes), otherAttr);

    output = realloc(output, sizeof(char) * (strlen(output) + 1));

    free(groupRects);
    free(groupCircles);
    free(groupPaths);
    free(groupGroups);
    free(otherAttr);

    return output;
}

int compareGroups(const void *first, const void *second)
{
    return 0;
}

List *getRects(SVGimage *image)
{
    if (image == NULL) return NULL;

    /* Search image->rect and groups's rectangles */
    /* I'm freeing more than I'm mallocing need to figure out how to point to all the rectangles in a list without copying the data. */
    // List *allImageRects = image->rectangles;

    /* Doing this way of getRect causes 48 bytes lost in 1 block and 72 bytes in 3 blocks using the svg image: quad01.svg from my bin. */

    List *allImageRects = initializeList(rectangleToString, dummyDelete, compareRectangles);
    // Group *groupNode;
    // void *groupElement;
    void *rectElement;
    // printf("Length of image->rectangles using length %d\n", allImageRects->length);

    // ListIterator groupIterator = createIterator(image->groups);
    ListIterator rectIterator;

    if (image->rectangles->length) {

        rectIterator = createIterator(image->rectangles);

        while ((rectElement = nextElement(&rectIterator)) != NULL) {
            
            insertBack(allImageRects, rectElement);
        }
    }

    if (image->groups != NULL) {
        if (image->groups->length > 0) getRectsInGroups(allImageRects, image->groups);
    } 

    return allImageRects;
}

void getRectsInGroups(List *allRects, List *listOfGroups)
{
    if (allRects == NULL || listOfGroups == NULL) return;

    Group *groupNode;
    void *groupElement;
    void *rectElement;
    ListIterator rectIterator;
    ListIterator groupIterator = createIterator(listOfGroups);

    while ((groupElement = nextElement(&groupIterator)) != NULL) {
        // printf("HELLO FROM while in getCircle\n");
        groupNode = (Group *)groupElement;
        
        if (groupNode->rectangles != NULL) {
            if (groupNode->rectangles->length) { // If circle list length > 0
                rectIterator = createIterator(groupNode->rectangles);
                // printf("WOW LEN OF groupNode Circle: %d\n", groupNode->circles->length);

                while ((rectElement = nextElement(&rectIterator))) {

                    insertBack(allRects, rectElement);
                }
            }
        }
        
        if (groupNode->groups != NULL) {
            if (groupNode->groups->length > 0) getRectsInGroups(allRects, groupNode->groups);
        }
    }
}

List *getCircles(SVGimage *image)
{
    if (image == NULL) return NULL;

    List *allImageCircles = initializeList(circleToString, dummyDelete, compareCircles);
    void *circleElement;

    ListIterator circleIterator;

    if (image->circles->length) {

        circleIterator = createIterator(image->circles);

        while ((circleElement = nextElement(&circleIterator))) {
            
            insertBack(allImageCircles, circleElement);
        }
    }

    if (image->groups != NULL) {
        if (image->groups->length > 0) getCirclesInGroups(allImageCircles, image->groups);
    }

    return allImageCircles;
}

void getCirclesInGroups(List *allCircles, List *listOfGroups)
{
    if (allCircles == NULL || listOfGroups == NULL) return;

    Group *groupNode;
    void *groupElement;
    void *circleElement;
    ListIterator circleIterator;
    ListIterator groupIterator = createIterator(listOfGroups);

    while ((groupElement = nextElement(&groupIterator)) != NULL) {
        // printf("HELLO FROM while in getCircle\n");
        groupNode = (Group *)groupElement;
        
        if (groupNode->circles != NULL) {
            if (groupNode->circles->length) { // If circle list length > 0
                circleIterator = createIterator(groupNode->circles);
                // printf("WOW LEN OF groupNode Circle: %d\n", groupNode->circles->length);

                while ((circleElement = nextElement(&circleIterator))) {

                    insertBack(allCircles, circleElement);
                }
            }
        }
        
        if (groupNode->groups != NULL) {
            if (groupNode->groups->length > 0) getCirclesInGroups(allCircles, groupNode->groups);
        }
    }
}

List *getGroups(SVGimage *image)
{
    if (image == NULL) return NULL;

    List *allImageGroups = initializeList(groupToString, dummyDelete, compareGroups);
    Group *groupNode;
    void *groupElement;
    // void *groupNodeElement;

    ListIterator groupIterator = createIterator(image->groups);

    while ((groupElement = nextElement(&groupIterator)) != NULL) {
        // // printf("HELLO FROM while in getGroups\n");
        groupNode = (Group *)groupElement;

        insertBack(allImageGroups, groupNode);

        if (groupNode->groups != NULL) {
            if (groupNode->groups->length) getGroupsInGroups(allImageGroups, groupNode->groups);
        }

    }

    return allImageGroups;
}

void getGroupsInGroups(List *allGroups, List *listOfGroups)
{
    if (allGroups == NULL || listOfGroups == NULL) return;

    Group *groupNode;
    // void *groupNodeElement;
    void *groupElement;
    
    ListIterator groupIterator = createIterator(listOfGroups);

    while ((groupElement = nextElement(&groupIterator)) != NULL) {
        groupNode = (Group *)groupElement;

        insertBack(allGroups, groupNode);
        
        if (groupNode->groups != NULL) {
            if (groupNode->groups->length > 0) getGroupsInGroups(allGroups, groupNode->groups);
        }
    }
}

List *getPaths(SVGimage *image)
{
    if (image == NULL) return NULL;

    List *allImagePaths = initializeList(pathToString, dummyDelete, comparePaths);
    // Group *groupNode;
    // void *groupElement;
    void *pathElement;

    // ListIterator groupIterator = createIterator(image->groups);
    ListIterator pathIterator; 

    if (image->paths != NULL) {
        if (image->paths->length) {

            pathIterator = createIterator(image->paths);

            while ((pathElement = nextElement(&pathIterator))) {

                insertBack(allImagePaths, pathElement);
            }
        }
    }

    if (image->groups != NULL) {
        if (image->groups->length > 0) getPathsInGroups(allImagePaths, image->groups);
    }

    return allImagePaths;
}

void getPathsInGroups(List *allPaths, List *listOfGroups)
{ // helper for get paths
    if (allPaths == NULL || listOfGroups == NULL) return;
    Group *groupNode;
    void *groupElement;
    void *pathElement;

    ListIterator groupIterator = createIterator(listOfGroups);
    ListIterator pathIterator;

    while ((groupElement = nextElement(&groupIterator)) != NULL) {
        // // printf("HELLO FROM while in getPath\n");
        groupNode = (Group *)groupElement;

        if (groupNode->paths != NULL) {
            if (groupNode->paths->length > 0) { // If circle list length > 0
                pathIterator = createIterator(groupNode->paths);

                while ((pathElement = nextElement(&pathIterator)) != NULL) {

                    insertBack(allPaths, pathElement);
                }
            }
        }

        if (groupNode->groups != NULL) { // if current group node has groups as children get those recursively
            if (groupNode->groups->length > 0) getPathsInGroups(allPaths, groupNode->groups);
        }
    }
}

int numRectsWithArea(SVGimage* img, float area)
{
    if (img == NULL || area < 0) return 0;
 
    int rectsWithArea = 0;
    float currNodeArea = 0;
    void *rectangleElement;
    List *rectList = getRects(img);
    ListIterator iterator = createIterator(rectList);
    Rectangle *rectNode;

    while ((rectangleElement = nextElement(&iterator))) {
        rectNode = (Rectangle *)rectangleElement;
        currNodeArea = rectNode->width * rectNode->height;
        
        if (ceil(area) == ceil(currNodeArea)) {
            rectsWithArea++;
        }
    }

    freeListNotData(rectList);
    free(rectList);

    // printf("PI: %f\n", PI);

    return rectsWithArea;
}

int numCirclesWithArea(SVGimage* img, float area)
{
    if (img == NULL || area < 0) return 0;
 
    int circlesWithArea = 0;
    float currNodeArea = 0;
    void *circleElement;
    List *circleList = getCircles(img);
    ListIterator iterator = createIterator(circleList);
    Circle *circleNode;

    while ((circleElement = nextElement(&iterator))) {
        circleNode = (Circle *)circleElement;
        currNodeArea = circleNode->r * circleNode->r * PI;
        
        if (ceil(area) == ceil(currNodeArea)) {
            circlesWithArea++;
        }
    }

    freeListNotData(circleList);
    free(circleList);

    return circlesWithArea;
}

int numPathsWithdata(SVGimage* img, char* data)
{
    if (img == NULL || strlen(data) < 0) return 0;
 
    int pathsWithData = 0;
    void *pathElement;
    List *pathList = getPaths(img);
    ListIterator iterator = createIterator(pathList);
    Path *pathNode;

    while ((pathElement = nextElement(&iterator))) {
        pathNode = (Path *)pathElement;

        if (strlen(data) == strlen(pathNode->data)) {

            for (int i = 0; i < strlen(data); i++) {

                if (tolower(data[i]) != tolower(pathNode->data[i])) {
                    // printf("YO WRONG DUDE\n");
                    break;
                } else if (i == (strlen(data) - 1)) {
                    // printf("YO HELLOASD\n");
                    pathsWithData++;
                }
            }   
        }
    }

    freeListNotData(pathList);
    free(pathList);

    return pathsWithData;
}

int numGroupsWithLen(SVGimage* img, int len)
{
    if (img == NULL || len < 0) return 0;
    
    int groupsWithLen = 0;
    int currGroupLen;
    void *groupElement;
    List *groupList = getGroups(img);
    ListIterator iterator = createIterator(groupList);
    Group *groupNode;

    while ((groupElement = nextElement(&iterator))) {

        groupNode = (Group *)groupElement;
        currGroupLen = 0; // reset length counter
        
        currGroupLen += groupNode->circles->length;
        currGroupLen += groupNode->rectangles->length;
        currGroupLen += groupNode->paths->length;
        currGroupLen += groupNode->groups->length;

        if (currGroupLen == len) groupsWithLen++;
    }

    freeListNotData(groupList);
    free(groupList);

    return groupsWithLen;
}

int numAttr(SVGimage* img)
{
    if (img == NULL) return 0;

    int totalAttr = 0;
    totalAttr = img->otherAttributes->length;

    List *rectList = getRects(img);
    List *circleList = getCircles(img);
    List *pathList = getPaths(img);
    List *groupList = getGroups(img);

    ListIterator rectIterator = createIterator(rectList);
    ListIterator circleIterator = createIterator(circleList);
    ListIterator pathIterator = createIterator(pathList);
    ListIterator groupIterator = createIterator(groupList);

    void *rectElement;
    void *circleElement;
    void *pathElement;
    void *groupElement;

    Rectangle *rect;
    Circle *circle;
    Path *path;
    Group *group;

    if (rectList != NULL) {

        if (rectList->length > 0) {

            while ((rectElement = nextElement(&rectIterator))) {
                rect = (Rectangle *)rectElement;
                totalAttr += rect->otherAttributes->length;
            }

        }

    }

    if (circleList != NULL) {

        if (circleList->length > 0) {
            
            while ((circleElement = nextElement(&circleIterator))) {
                circle = (Circle *)circleElement;
                totalAttr += circle->otherAttributes->length;
            }

        }

    }

    if (pathList != NULL) {

        if (pathList->length > 0) {
            
            while ((pathElement = nextElement(&pathIterator))) {
                path = (Path *)pathElement;
                totalAttr += path->otherAttributes->length;
            }
            
        }

    }

    if (groupList != NULL) {

        if (groupList->length > 0) {
            
            while ((groupElement = nextElement(&groupIterator))) {
                group = (Group *)groupElement;
                totalAttr += group->otherAttributes->length;
            }
            
        }

    }

    /* DO NOT FREE attrList */
    if (rectList != NULL) freeListNotData(rectList);
    if (circleList != NULL) freeListNotData(circleList);
    if (pathList != NULL) freeListNotData(pathList);
    if (groupList != NULL) freeListNotData(groupList);
    if (rectList != NULL) free(rectList);
    if (circleList != NULL) free(circleList);
    if (pathList != NULL) free(pathList);
    if (groupList != NULL) free(groupList);

    return totalAttr;
}

bool validateSVGimage(SVGimage* image, char* schemafile)
{
    /* Schema and image are valid and not empty.
    Return true unless image is not valid through condition checks. */
    if (image == NULL || schemafile == NULL || strlen(schemafile) == 0) {
        // printf("SOMETHING IS NULL in validateSVGimage\n");
        return false;
    }

    // Part 1
    if (validateImage(image, schemafile)) { // Valid image
        // printf("if in validateSVGimage is True\n");
    } else {
        // printf("if in validateSVGimage is False\n");
        return false;
    }

    if (imageViolatesConstraints(image)) { // Image doesn't follow assignment spec and therefore an invalid image
        // printf("if when comparing image to constraints in assignment TRUE (BAD)\n");
        return false;
    } else { // Image follows assignment specs
        // printf("if when comparing image to constraints in assignment FALSE (GOOD)\n");
    }

    return true;
}

SVGimage* createValidSVGimage(char* filename, char* schemafile)
{
    SVGimage *image = NULL;
    xmlDoc *doc = NULL;
    xmlNode *root_node = NULL;

    /* Check if filename is valid */

    if (filename == NULL) {
        // printf("error: filename doesn't exist\n");
        return NULL;
    } 

    if (strcmp("", filename) == 0) { // If filename is empty
        // printf("error: no filename\n");
        return NULL;
    }

    /* Check if schemafile is valid */
    
    if (schemafile == NULL) {
        return NULL;
    } 

    if (strcmp("", schemafile) == 0) { // If schemafile is empty
        return NULL;
    }

    doc = xmlReadFile(filename, NULL, 0);
    if (doc == NULL) {
        xmlCleanupParser();
        return NULL;
    }
    /* Validate XML doc */

    if (!(validateXmlDoc(schemafile, doc))) { // If not valid xml doc do stuff
        // printf("Oh jeez I failed \n");
        xmlFreeDoc(doc);
        xmlCleanupParser();
        return NULL;
    }
    // printf("Ready to dab?\n");

    root_node = xmlDocGetRootElement(doc);
    if (root_node == NULL) {
        if (doc != NULL) xmlFreeDoc(doc);
        xmlCleanupParser();
        return NULL;
    }

    image = (SVGimage *)calloc(1, sizeof(SVGimage));
    image->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);
    image->paths = initializeList(pathToString, deletePath, comparePaths);
    image->circles = initializeList(circleToString, deleteCircle, compareCircles);
    image->rectangles = initializeList(rectangleToString, deleteRectangle, compareRectangles);
    image->groups = initializeList(groupToString, deleteGroup, compareGroups);

    parseSVG(root_node, image);
    
    if (doc != NULL) xmlFreeDoc(doc);
    
    xmlCleanupParser();

    return image; // Returns pointer to SVG object
}

bool writeSVGimage(SVGimage* image, char* filename)
{
    // Contains code from http://www.xmlsoft.org/examples/tree2.c provided by Prof. Nikitenko

    // Add check for null image and filename here!!!!
    if (image == NULL || filename == NULL || strlen(filename) == 0) { // Commented out cuz I pass NULL for filename for testing purposes
        // printf("CHECK if FILENAME/IMAGE is NULL in main or wherever it's being called\n");
        return false;
    }

    xmlDoc *doc = NULL; // Need a doc to save to, which will then be written
    xmlNode *root_node = NULL;
    bool valid = false; // Assume it's not valid until it reaches end of function

    setupDoc(image, &root_node, &doc); // Need to send address of root and doc to modify these pointers

    // int argc = 1; // This helps the xmlSaveFormatFileEnc print to terminal

    // if (xmlSaveFormatFileEnc(argc > 1 ? "test" : "-", doc, "UTF-8", 1) == -1) { // MAKE SURE TO CHECK IF filename is still NULL in main
        // printf("Hello boiiiii\n");
    if (xmlSaveFormatFileEnc(filename, doc, "UTF-8", 1) == -1) { // MAKE SURE TO CHECK IF filename is still NULL in main
    } else { // No errors
        // printf("REMEMBER TO REMOVE THIS PRINT STATEMENT THE FUNCTION CALL 'xmlSaveFormatFileEnc' RIGHT BELOW THIS IN CODE\n");
        // xmlSaveFormatFileEnc(argc > 1 ? "test" : "-", doc, "UTF-8", 1);
        valid = true;
    }
    
    xmlFreeDoc(doc);
    xmlCleanupParser();
    return valid;
}

void setAttribute(SVGimage* image, elementType elemType, int elemIndex, Attribute* newAttribute)
{
    // elemType goes from 0 - 4 
    // bool invalidType = false;
    if (image == NULL || (elemType != CIRC && elemType != RECT && elemType != PATH && elemType != SVG_IMAGE && elemType != GROUP) || newAttribute == NULL) return;

    // elemIndex doesn't matter if it's SVG image's attributes being updated
    if (newAttribute->name == NULL || newAttribute->value == NULL) return;

    if (elemType == SVG_IMAGE) { // There must be at least one element to update
        
        updateSVGAttr(image, newAttribute); // works: tried with viewBox
        // if (newAttribute == NULL) printf("printing NULL\n");
    
    } else if (elemType == CIRC) {
        
        updateCircleAttr(image, newAttribute, elemIndex);
    
    } else if (elemType == RECT) {
        
        updateRectAttr(image, newAttribute, elemIndex);
    
    } else if (elemType == PATH) {

        updatePathAttr(image, newAttribute, elemIndex);
    
    } else if (elemType == GROUP) {
        
        updateGroupAttr(image, newAttribute, elemIndex);
    
    } /* else {
        if (newAttribute->name != NULL) free(newAttribute->name);
        if (newAttribute->value != NULL) free(newAttribute->value);
        if (newAttribute != NULL) free(newAttribute);
    } */
}

void addComponent(SVGimage* image, elementType type, void* newElement)
{
    // elemType goes from 0 - 4 
    if (type != CIRC && type != RECT && type != PATH) return; // Path, Rects and Circles
    if (image == NULL) return;
    if (newElement == NULL) return;

    if (type == CIRC) { // Handling circles
        /* Add checks for newElement */
        Circle *circleElem = (Circle *)newElement;
        if (circleElem == NULL) return;
        // printf("circleElem entered!\n");

        // if (circleElem->units == NULL) return;
        // if (circleElem->r < 0 ) return;
        // if (circleElem->otherAttributes == NULL) return;
        // if (circleElem->otherAttributes->length) if (!areOtherAttrValid(circleElem->otherAttributes)) return;

        // printf("circleElem checks passed!\n");

        /* Make a helper to check that the other attributes are valid as well */

        insertBack(image->circles, circleElem);
    } else if (type == RECT) { // Handling rectangles
        /* Add checks for newElement */
        Rectangle *rectElem = (Rectangle *)newElement;
        if (rectElem == NULL) return;
        // printf("rectElem entered!\n");
        
        // if (rectElem->units == NULL) return;
        // if (rectElem->width < 0 || rectElem->height < 0) return;
        // if (rectElem->otherAttributes == NULL) return;
        // printf("rectelem other attr list len; %d\n", rectElem->otherAttributes->length);
        // if (rectElem->otherAttributes->length) if (!areOtherAttrValid(rectElem->otherAttributes)) return;

        // printf("rectElem checks passed!\n");

        /* Make a helper to check that the other attributes are valid as well */

        insertBack(image->rectangles, rectElem);
    } else { // Handling Paths
        /* Add checks for newElement */
        Path *pathElem = (Path *)newElement;
        if (pathElem == NULL) return;
        // printf("pathElem entered!\n");

        // if (pathElem->data == NULL) return;
        // if (pathElem->otherAttributes == NULL) return;
        // if (pathElem->otherAttributes->length) if (!areOtherAttrValid(pathElem->otherAttributes)) return;

        // printf("pathElem checks passed!\n");

        /* Make a helper to check that the other attributes are valid as well */

        insertBack(image->paths, pathElem);
    }

}

char* attrToJSON(const Attribute *a)
{
    char *attrJSON = calloc(100000, sizeof(char)); // enough for empty string '{}' and null
    if (a == NULL) {
        sprintf(attrJSON, "{}"); // return empty string
    } else {
        sprintf(attrJSON, "{\"name\":\"%s\",\"value\":\"%s\"}", a->name, a->value); // {"name":"attrNameHere","value":"valueOfAttr"} and NO newline
    }

    attrJSON = realloc(attrJSON, sizeof(char) * strlen(attrJSON) + 1);

    return attrJSON;
}

char* circleToJSON(const Circle *c)
{
    char *circleJSON = calloc(100000, sizeof(char)); // enough for empty string '{}' and null
    if (c == NULL) {
        sprintf(circleJSON, "{}"); // return empty string
    } else {
        int otherAttrLen = 0;
        if (c->otherAttributes != NULL) {
            otherAttrLen = c->otherAttributes->length;
        }
        sprintf(circleJSON, "{\"cx\":%.2lf,\"cy\":%.2lf,\"r\":%.2lf,\"numAttr\":%d,\"units\":\"%s\"}", c->cx, c->cy, c->r, otherAttrLen, c->units); // {"cx":cxVal,"cy":cyVal,"r":rVal,"numAttr":attrVal,"units":"unitStr"} and NO newline
    }

    circleJSON = realloc(circleJSON, sizeof(char) * strlen(circleJSON) + 1);

    return circleJSON;
}

char* rectToJSON(const Rectangle *r)
{
    char *rectJSON = calloc(100000, sizeof(char)); // enough for empty string '{}' and null
    if (r == NULL) {
        sprintf(rectJSON, "{}"); // return empty string
    } else {
        int otherAttrLen = 0;
        if (r->otherAttributes != NULL) {
            otherAttrLen = r->otherAttributes->length;
        }
        sprintf(rectJSON, "{\"x\":%.2lf,\"y\":%.2lf,\"w\":%.2lf,\"h\":%.2lf,\"numAttr\":%d,\"units\":\"%s\"}", r->x, r->y, r->width, r->height, otherAttrLen, r->units);
    }

    rectJSON = realloc(rectJSON, sizeof(char) * strlen(rectJSON) + 1);

    return rectJSON;
}

char* pathToJSON(const Path *p)
{
    char *pathJSON = calloc(100000, sizeof(char)); // enough for empty string '{}' and null
    if (p == NULL) {
        sprintf(pathJSON, "{}"); // return empty string
    } else {
        int otherAttrLen = 0;
        if (p->otherAttributes != NULL) {
            otherAttrLen = p->otherAttributes->length;
        }
        sprintf(pathJSON, "{\"d\":\"%s\",\"numAttr\":%d}", p->data, otherAttrLen);
    }

    pathJSON = realloc(pathJSON, sizeof(char) * strlen(pathJSON) + 1);

    return pathJSON;
}

char* groupToJSON(const Group *g)
{
    char *groupJSON = calloc(100000, sizeof(char)); // enough for empty string '{}' and null
    if (g == NULL) {
        sprintf(groupJSON, "{}"); // return empty string
    } else {
        int gRectLen = 0;
        int gCircLen = 0;
        int gPathLen = 0;
        int gGroupLen = 0;

        if (g->rectangles != NULL) {
            gRectLen = g->rectangles->length;
        }

        if (g->circles != NULL) {
            gCircLen = g->circles->length;
        }
        
        if (g->paths != NULL) {
            gPathLen = g->paths->length;
        }
        
        if (g->groups != NULL) {
            gGroupLen = g->groups->length;
        }

        int numOfChildren = gRectLen + gCircLen + gPathLen + gGroupLen;
        sprintf(groupJSON, "{\"children\":%d,\"numAttr\":%d}", numOfChildren, g->otherAttributes->length);
    }

    groupJSON = realloc(groupJSON, sizeof(char) * strlen(groupJSON) + 1);

    return groupJSON;
}

char* attrListToJSON(const List *list)
{
    char *listToJSON = calloc(1000000, sizeof(char));

    if (list == NULL || list->length == 0) {

        sprintf(listToJSON, "[]");

    } else {
        
        ListIterator iterate = createIterator((List *)list);
        void *element;
        int counter = 0;

        strcpy(listToJSON, "[");

        while ((element = nextElement(&iterate))) {
            
            Attribute *attrJSON = (Attribute *)element;
            char *returnStr = attrToJSON(attrJSON);
            strcat(listToJSON, returnStr);
            free(returnStr);

            if (counter != (list->length - 1)) {
                strcat(listToJSON, ",");
            }

            counter++;
        }

        strcat(listToJSON, "]");

    }
    
    listToJSON = realloc(listToJSON, sizeof(char) * strlen(listToJSON) + 1);

    return listToJSON;
}

char* circListToJSON(const List *list)
{
    char *listToJSON = calloc(1000000, sizeof(char));

    if (list == NULL || list->length == 0) {

        sprintf(listToJSON, "[]");

    } else {
        
        ListIterator iterate = createIterator((List *)list);
        void *element;
        int counter = 0;

        strcpy(listToJSON, "[");

        while ((element = nextElement(&iterate))) {
            
            Circle *circleJSON = (Circle *)element;
            char *returnStr = circleToJSON(circleJSON);
            strcat(listToJSON, returnStr);
            free(returnStr);

            if (counter != (list->length - 1)) {
                strcat(listToJSON, ",");
            }

            counter++;
        }

        strcat(listToJSON, "]");

    }
    
    listToJSON = realloc(listToJSON, sizeof(char) * strlen(listToJSON) + 1);

    return listToJSON;
}

char* rectListToJSON(const List *list)
{
    char *listToJSON = calloc(1000000, sizeof(char));

    if (list == NULL || list->length == 0) {

        sprintf(listToJSON, "[]");

    } else {
        
        ListIterator iterate = createIterator((List *)list);
        void *element;
        int counter = 0;

        strcpy(listToJSON, "[");

        while ((element = nextElement(&iterate))) {
            
            Rectangle *rectJSON = (Rectangle *)element;
            char *returnStr = rectToJSON(rectJSON);
            strcat(listToJSON, returnStr);
            free(returnStr);

            if (counter != (list->length - 1)) {
                strcat(listToJSON, ",");
            }

            counter++;
        }

        strcat(listToJSON, "]");

    }
    
    listToJSON = realloc(listToJSON, sizeof(char) * strlen(listToJSON) + 1);

    return listToJSON;
}

char* pathListToJSON(const List *list)
{
    char *listToJSON = calloc(1000000, sizeof(char));

    if (list == NULL || list->length == 0) {

        sprintf(listToJSON, "[]");

    } else {
        
        ListIterator iterate = createIterator((List *)list);
        void *element;
        int counter = 0;

        strcpy(listToJSON, "[");

        while ((element = nextElement(&iterate))) {
            
            Path *pathJSON = (Path *)element;
            char *returnStr = pathToJSON(pathJSON);
            strcat(listToJSON, returnStr);
            free(returnStr);

            if (counter != (list->length - 1)) {
                strcat(listToJSON, ",");
            }

            counter++;
        }

        strcat(listToJSON, "]");

    }
    
    listToJSON = realloc(listToJSON, sizeof(char) * strlen(listToJSON) + 1);

    return listToJSON;
}

char* groupListToJSON(const List *list)
{
    char *listToJSON = calloc(1000000, sizeof(char));

    if (list == NULL || list->length == 0) {

        sprintf(listToJSON, "[]");

    } else {
        
        ListIterator iterate = createIterator((List *)list);
        void *element;
        int counter = 0;

        strcpy(listToJSON, "[");

        while ((element = nextElement(&iterate))) {
            
            Group *groupJSON = (Group *)element;
            char *returnStr = groupToJSON(groupJSON);
            strcat(listToJSON, returnStr);
            free(returnStr);

            if (counter != (list->length - 1)) {
                strcat(listToJSON, ",");
            }

            counter++;
        }

        strcat(listToJSON, "]");

    }
    
    listToJSON = realloc(listToJSON, sizeof(char) * strlen(listToJSON) + 1);

    return listToJSON;
}

char* SVGtoJSON(const SVGimage* image)
{
    char *SVGToJSON = calloc(10000, sizeof(char)); // enough for empty string '{}' and null
    if (image == NULL) {
        sprintf(SVGToJSON, "{}"); // return empty string
    } else {
        List *rectList = getRects((SVGimage*)image);
        List *circleList = getCircles((SVGimage*)image);
        List *pathList = getPaths((SVGimage*)image);
        List *groupList = getGroups((SVGimage*)image);

        int rectLen = 0;
        int circleLen = 0;
        int pathLen = 0;
        int groupLen = 0;

        if (rectList != NULL) rectLen = rectList->length;
        if (circleList != NULL) circleLen = circleList->length;
        if (pathList != NULL) pathLen = pathList->length;
        if (groupList != NULL) groupLen = groupList->length;

        sprintf(SVGToJSON, "{\"numRect\":%d,\"numCirc\":%d,\"numPaths\":%d,\"numGroups\":%d}", rectLen, circleLen, pathLen, groupLen);
        SVGToJSON = realloc(SVGToJSON, sizeof(char) * strlen(SVGToJSON) + 1);

        if (rectList != NULL) freeListNotData(rectList);
        if (circleList != NULL) freeListNotData(circleList);
        if (pathList != NULL) freeListNotData(pathList);
        if (groupList != NULL) freeListNotData(groupList);
        if (rectList != NULL) free(rectList);
        if (circleList != NULL) free(circleList);
        if (pathList != NULL) free(pathList);
        if (groupList != NULL) free(groupList);
    }

    return SVGToJSON;
}

/* SVGimage* JSONtoSVG(const char* svgString)
{
    // if (svgString == NULL) return;

    
}

Rectangle* JSONtoRect(const char* svgString)
{
    Rectangle *rect = calloc(1, sizeof(Rectangle));
    // printf(svgString);
    // return NULL;
    if (svgString == NULL || strlen(svgString) == 2) return NULL;

    if (strlen(svgString) > 2) { // does not contain []
        char *key = calloc(1000, sizeof(char)); // i.e. "name"
        char *value = calloc(1000, sizeof(char)); // i.e. "fill"
        int index = 0;
        int j = 0;

        for (int i = 0; svgString[i] != ']' && svgString[i] != '}'; i++) { // loop through entire string

            if (svgString[i] == '\"') { // found a potential field to search
                printf("In first IF\n");
                printf("string: %c\n", svgString[i + 1]);
                // return NULL;
                index = 0;
                j = 0;
                for (j = i + 1; svgString[j] != '\"'; j++) { // loop until closing double quotes is found
                    if (svgString[j] == '\"') {
                        printf("BREAKING\n");
                        
                        return NULL;
                    }
                    key[index] = svgString[j];

                    index++;
                }
                
                i = j; // so this for loop doesn't get triggered again for the closing double quote

            }

            if (svgString[i] == ':' && (isdigit(svgString[i + 1]) || svgString[i + 1] == '\"')) { // parse keys
                printf("In second IF\n");
                // return NULL;

                index = 0;
                
                if (svgString[i + 1] == '\"') {
                    i++; // so the for loop can start parsing alphabets instead of starting at double quotes
                }
                j = 0;

                for (int j = i + 1; svgString[j] != ',' && svgString[j] != '}' && svgString[j] != ']'; j++) {
                    // printf("i: %d\nj:%d\n", i, j);
                    // if (svgString[j] == '}' || svgString[j] == ']' || svgString[j] == ',') {
                    //     printf("BREAKING\n");
                        
                    //     return NULL;
                    // }
                    value[index] = svgString[j];

                    // i = j;
                    index++;
                }

                i = j; // so this for loop doesn't get triggered again for the closing double quote

            }

            if (strlen(key) > 0 && strlen(value) > 0) {
                
                fillInValues(RECT, rect, key, value); // helper function to 
                
                // clearing the array for later use
                memset(key, 0, strlen(key));
                memset(value, 0, strlen(value));

            }

        }

        free(key);
        free(value);

    }

    return rect;
}

Circle* JSONtoCircle(const char* svgString)
{

} */


/* 
******************************************************
*                 Helper Functions                   *
******************************************************
*/

/* A3 Functions START */

// need this function to 
char *getJSONofSVG (char *file)
{
    SVGimage *image = createValidSVGimage(file, "parser/bin/svg.xsd");
    char *stringToReturn;

    if (image != NULL) {
        stringToReturn = SVGtoJSON(image);
    } else {
        stringToReturn = (char *)calloc(5, sizeof(char));
        strcpy(stringToReturn, "null");
        return stringToReturn;
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    if (strcmp(stringToReturn, "{}") == 0) { // Returned empty object
        free(stringToReturn);
        stringToReturn = (char *)calloc(5, sizeof(char));
        strcpy(stringToReturn, "null");
    }

    return stringToReturn; // might wanna check with just sending '{}'
}

char *getJSONforViewPanel (char *file)
{
    SVGimage *image = createSVGimage(file);
    char *stringToReturn;

    if (image != NULL) {
        stringToReturn = (char *)calloc(2, sizeof(char));
        char *temp = (char *)calloc(100000, sizeof(char));

        strcpy(stringToReturn, "{");
        sprintf(temp, "\"title\":\"%s\",\"desc\":\"%s\",\"rectList\":%s,\"circList\":%s,\"pathList\":%s,\"groupList\":%s", image->title, image->description, rectListToJSON(image->rectangles), circListToJSON(image->circles), pathListToJSON(image->paths), groupListToJSON(image->groups));
        stringToReturn = realloc(stringToReturn, sizeof(char) * strlen(temp) + 2);
        strcat(stringToReturn, temp);
        strcat(stringToReturn, "}");
        free(temp);
    } else {
        stringToReturn = (char *)calloc(5, sizeof(char));
        strcpy(stringToReturn, "null");
        return stringToReturn;
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    return stringToReturn;
}

char *getJSONforOtherAttr(char *file, char *elementType, int elemIndex)
{
    SVGimage *image = createValidSVGimage(file, "parser/bin/svg.xsd");
    char *strToReturn = (char *)calloc(5, sizeof(char));
    strcpy(strToReturn, "null");

    if (image != NULL) {
        int index = 0;
        ListIterator iterate;
        void *element;

        if (strcmp("rect", elementType) == 0) {
            iterate = createIterator(image->rectangles);
        } else if (strcmp("circ", elementType) == 0) {
            iterate = createIterator(image->circles);
        } else if (strcmp("path", elementType) == 0) {
            iterate = createIterator(image->paths);
        } else if (strcmp("group", elementType) == 0) {
            iterate = createIterator(image->groups);
        }

        while ((element = nextElement(&iterate)) != NULL) {
            
            if (index == elemIndex) {

                free(strToReturn); // free the "null" it contained

                if (strcmp("rect", elementType) == 0) {
                    strToReturn = attrListToJSON(((Rectangle *)element)->otherAttributes);
                } else if (strcmp("circ", elementType) == 0) {
                    strToReturn = attrListToJSON(((Circle *)element)->otherAttributes);
                } else if (strcmp("path", elementType) == 0) {
                    strToReturn = attrListToJSON(((Path *)element)->otherAttributes);
                } else if (strcmp("group", elementType) == 0) {
                    strToReturn = attrListToJSON(((Group *)element)->otherAttributes);
                }

                break;
            }
            
            index++;
        }
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    return strToReturn;
}

// Update the image's title, using the 
char *updateTitleOfSVG(char *file, char *newTitle)
{
    SVGimage *image = createSVGimage(file);
    char *returnStatus = (char *)calloc(27, sizeof(char));
    strcpy(returnStatus, "\"Title failed to update\"");

    if (image != NULL) {

        if (strlen(newTitle) > 255) {

            strncpy(image->title, newTitle, 255);
            image->title[255] = '\0';

        } else if (newTitle == NULL || strlen(newTitle) == 0) {

            strcpy(image->title, "");

        } else {

            strcpy(image->title, newTitle);

        }

        // return returnStatus;
        if (writeSVGimage(image, file)) { // the image written is valid, then return success
            free(returnStatus);
            returnStatus = (char *)calloc(31, sizeof(char));
            strcpy(returnStatus, "\"Title successfully updated\"");
        }
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    return returnStatus;
}

char *updateDescOfSVG(char *file, char *newDesc) 
{
    SVGimage *image = createSVGimage(file);
    char *returnStatus = (char *)calloc(33, sizeof(char));
    strcpy(returnStatus, "\"Description failed to update\"");

    if (image != NULL) {

        if (strlen(newDesc) > 255) {

            strncpy(image->description, newDesc, 255);
            image->description[255] = '\0';

        } else if (newDesc == NULL || strlen(newDesc) == 0) {

            strcpy(image->description, "");

        } else {

            strcpy(image->description, newDesc);

        }

        // return returnStatus;
        if (writeSVGimage(image, file)) { // the image written is valid, then return success
            free(returnStatus);
            returnStatus = (char *)calloc(37, sizeof(char));
            strcpy(returnStatus, "\"Description successfully updated\"");
        }
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    return returnStatus;
}

char *validateSVGforServer(char *file)
{
    SVGimage *image = createValidSVGimage(file, "parser/bin/svg.xsd");
    bool checkValidity = validateSVGimage(image, "parser/bin/svg.xsd");
    char *returnStr;

    if (checkValidity) { // valid
        returnStr = (char*) calloc(5, sizeof(char));
        strcpy(returnStr, "true");
    } else { // not valid
        returnStr = (char*) calloc(6, sizeof(char));
        strcpy(returnStr, "false");
    }

    if (image != NULL) {
        deleteSVGimage(image);
    }

    return returnStr;
}

/* A3 Functions END */

// void fillInValues(elementType elemType, void *element, char *key, char *value)
// {
//     // use this function to fill in values
//     if (elemType == CIRC) {

//     } else if (elemType == RECT) {
//         // no real functionality yet, just want to check JSONtoRect works properly
//         // printf("Key: %s\nValue: %s\n", key, value);
//         // printf("FROM fillInValues\n");
//     } else if (elemType == SVG_IMAGE) {

//     }
// }

void updateGroupAttr(SVGimage *image, Attribute *newAttr, int elemIndex)
{
    ListIterator iterate = createIterator(image->groups);
    void *groupElem;
    Group *groupNode;

    int indexTraverse = 0;

    while ((groupElem = nextElement(&iterate))) {
        if (indexTraverse == elemIndex) {
            // printf("I have entered\n");
            groupNode = (Group *)groupElem;

            if (groupNode->otherAttributes != NULL) updateOtherAttr(groupNode->otherAttributes, newAttr);

        } else if (indexTraverse > elemIndex) {
            return;
        }

        indexTraverse++;
    }
}

void updatePathAttr(SVGimage *image, Attribute *newAttr, int elemIndex)
{
    ListIterator iterate = createIterator(image->paths);
    void *pathElem;
    Path *pathNode;

    int indexTraverse = 0;

    while ((pathElem = nextElement(&iterate))) {
        if (indexTraverse == elemIndex) {
            // printf("I have entered\n");
            pathNode = (Path *)pathElem;

            if (strcmp(newAttr->name, "d") == 0) {
                
                free(pathNode->data);

                pathNode->data = (char *)calloc(strlen(newAttr->value) + 1, sizeof(char));
                strcpy(pathNode->data, newAttr->value);

                if (newAttr->name != NULL) free(newAttr->name);
                if (newAttr->value != NULL) free(newAttr->value);
                if (newAttr != NULL) free(newAttr);

            } else { // if the user wants to update other attributes 
                updateOtherAttr(pathNode->otherAttributes, newAttr);
            }

        } else if (indexTraverse > elemIndex) {
            return;
        }

        indexTraverse++;
    }
}

void updateRectAttr(SVGimage *image, Attribute *newAttr, int elemIndex)
{
    ListIterator iterate = createIterator(image->rectangles);
    void *rectElem;
    Rectangle *rectNode;
    // void *otherAttrElem;
    // Attribute *attrToUpdate;

    int indexTraverse = 0;

    while ((rectElem = nextElement(&iterate))) {
        if (indexTraverse == elemIndex) {
            
            rectNode = (Rectangle *)rectElem;

            if (strcmp(newAttr->name, "x") == 0 || strcmp(newAttr->name, "y") == 0 || strcmp(newAttr->name, "width") == 0 || strcmp(newAttr->name, "height") == 0) {
                if (strcmp(newAttr->name, "x") == 0) {
                    
                    rectNode->x = atof(newAttr->value);
                
                } else if (strcmp(newAttr->name, "y") == 0) {
                
                    rectNode->y = atof(newAttr->value);
                
                } else if (strcmp(newAttr->name, "width") == 0) {
                
                    rectNode->width = atof(newAttr->value);

                } else if (strcmp(newAttr->name, "height") == 0) {

                    rectNode->height = atof(newAttr->value);
                
                }

                if (newAttr->name != NULL) free(newAttr->name);
                if (newAttr->value != NULL) free(newAttr->value);
                if (newAttr != NULL) free(newAttr);

            } else { // if the user wants to update other attributes 
                updateOtherAttr(rectNode->otherAttributes, newAttr);
            }

        } else if (indexTraverse > elemIndex) {
            return;
        }

        indexTraverse++;
    }
}

void updateCircleAttr(SVGimage *image, Attribute *newAttr, int elemIndex)
{
    ListIterator iterate = createIterator(image->circles);
    void *circleElem;
    Circle *circleNode;
    // void *otherAttrElem;
    // Attribute *attrToUpdate;

    int indexTraverse = 0;

    while ((circleElem = nextElement(&iterate))) {
        if (indexTraverse == elemIndex) {
            // printf("I have entered\n");
            circleNode = (Circle *)circleElem;
            // char *string = toString(circleNode->otherAttributes);
            // printf("Printing current circle's other attributes: %s", string);
            // free(string);
            if (strcmp(newAttr->name, "cx") == 0 || strcmp(newAttr->name, "cy") == 0 || strcmp(newAttr->name, "r") == 0) {
                
                if (strcmp(newAttr->name, "cx") == 0) {
                    
                    circleNode->cx = atof(newAttr->value);
                
                } else if (strcmp(newAttr->name, "cy") == 0) {

                    circleNode->cy = atof(newAttr->value);
                
                } else if (strcmp(newAttr->name, "r") == 0) {

                    circleNode->r = atof(newAttr->value);

                }

                if (newAttr->name != NULL) free(newAttr->name);
                if (newAttr->value != NULL) free(newAttr->value);
                if (newAttr != NULL) free(newAttr);

            } else { // if the user wants to update other attributes 
                updateOtherAttr(circleNode->otherAttributes, newAttr);
            }

        } else if (indexTraverse > elemIndex) {
            return;
        }

        indexTraverse++;
    }
}

void updateSVGAttr(SVGimage *image, Attribute *newAttr)
{
    if (strcmp(newAttr->name, "xmlns") == 0) {
        // printf("entering xmlns\n");

        if (strlen(newAttr->value) > 255) {

            strncpy(image->namespace, newAttr->value, 255);
            image->namespace[255] = '\0';

            } else if (newAttr->value == NULL || strlen(newAttr->value) == 0) {

                strcpy(image->namespace, "");

            } else {

                strcpy(image->namespace, newAttr->value);

            }

        if (newAttr->name != NULL) free(newAttr->name);
        if (newAttr->value != NULL) free(newAttr->value);
        if (newAttr != NULL) free(newAttr);

    } else if (strcmp(newAttr->name, "desc") == 0) {
        // printf("entering desc\n");

        if (strlen(newAttr->value) > 255) {

            strncpy(image->description, newAttr->value, 255);
            image->description[255] = '\0';

            } else if (newAttr->value == NULL || strlen(newAttr->value) == 0) {

                strcpy(image->description, "");

            } else {

                strcpy(image->description, newAttr->value);

            }

        if (newAttr->name != NULL) free(newAttr->name);
        if (newAttr->value != NULL) free(newAttr->value);
        if (newAttr != NULL) free(newAttr);

    } else if (strcmp(newAttr->name, "title") == 0) {
        // printf("entering title\n");
        if (strlen(newAttr->value) > 255) {

            strncpy(image->title, newAttr->value, 255);
            image->title[255] = '\0';

            } else if (newAttr->value == NULL || strlen(newAttr->value) == 0) {

                strcpy(image->title, "");

            } else {

                strcpy(image->title, newAttr->value);

            }

        if (newAttr->name != NULL) free(newAttr->name);
        if (newAttr->value != NULL) free(newAttr->value);
        if (newAttr != NULL) free(newAttr);

    } else {
        // printf("entering other\n");

        updateOtherAttr(image->otherAttributes, newAttr);
    }
}

void updateOtherAttr(List *listOfOtherAttr, Attribute *newAttr)
{
    if (listOfOtherAttr == NULL) return;
    
    ListIterator iterate = createIterator(listOfOtherAttr);
    void *otherAttrElem;
    Attribute *attrToUpdate;
    bool exists = false;

    if (listOfOtherAttr->length > 0) {
        while ((otherAttrElem = nextElement(&iterate))) {
            attrToUpdate = (Attribute *)otherAttrElem;

            if (strcmp(newAttr->name, attrToUpdate->name) == 0) {
                exists = true;
                free(attrToUpdate->value);
                
                attrToUpdate->value = (char *)calloc(strlen(newAttr->value) + 1, sizeof(char));
                strcpy(attrToUpdate->value, newAttr->value);
            }
        }
    }

        if (!exists) { // if the attr to update doesn't exist, add it to the end of the list
            if (newAttr != NULL && newAttr->name != NULL && newAttr->value != NULL) {
                insertBack(listOfOtherAttr, newAttr);
            } 

        } else {
            if (newAttr->name != NULL) free(newAttr->name);
            if (newAttr->value != NULL) free(newAttr->value);
            if (newAttr != NULL) free(newAttr);
            // newAttr = NULL;
            // newAttr->name = NULL;
            // newAttr->value = NULL;
        }
}

bool areOtherAttrValid(List *list)
{
    if (list == NULL) return false;
    
    ListIterator iterate = createIterator(list);
    void *attrElem;
    Attribute *attr;

    while ((attrElem = nextElement(&iterate))) {
        attr = (Attribute *)attrElem;

        if (attr->name == NULL) return false;
        if (attr->value == NULL) return false;
    }

    return true;
}

bool areListsValid(SVGimage *image)
{   
    // printf("Entering listChecker\n");
    if (image->rectangles == NULL) return false;
    // printf("Entering image rect\n");
    if (image->circles == NULL) return false;
    // printf("Entering image circles\n");
    if (image->paths == NULL) return false;
    // printf("Entering image paths\n");
    if (image->groups == NULL) return false;
    // printf("Entering image groups\n");
    if (image->otherAttributes == NULL) return false;
    // printf("Entering image other attr\n");

    if (image->groups->length > 0) { // At least one group node
        // printf("HELLO\n");
        List *allGroups = getGroups(image);
        Group *groupNode;
        void *groupElement;

        ListIterator iterator = createIterator(allGroups);

        while ((groupElement = nextElement(&iterator))) {
            groupNode = (Group *)groupElement;

            if (groupNode->rectangles == NULL) {
                freeListNotData(allGroups);
                free(allGroups);
                return false;
            }
            // printf("Entering group node rect\n");
            if (groupNode->circles == NULL) {
                freeListNotData(allGroups);
                free(allGroups);
                return false;
            }
            // printf("Entering group node circles\n");
            if (groupNode->paths == NULL) {
                freeListNotData(allGroups);
                free(allGroups);
                return false;
            }
            // printf("Entering group node paths\n");
            if (groupNode->groups == NULL) {
                freeListNotData(allGroups);
                free(allGroups);
                return false;
            }
            // printf("Entering group node groups\n");
            if (groupNode->otherAttributes == NULL) {
                freeListNotData(allGroups);
                free(allGroups);
                return false;
            } else if (groupNode->otherAttributes->length > 0) {
                if (!areOtherAttrValid(groupNode->otherAttributes)) {
                    freeListNotData(allGroups);
                    free(allGroups);
                    allGroups = NULL;
                    return false;
                }
            }
            // printf("Entering group node other attr\n");
        }
        
        if (allGroups != NULL) {
            freeListNotData(allGroups);
            free(allGroups);
            allGroups = NULL;
        }
    }

    /* Go through all element types and check their other attributes */
    if (image->circles->length > 0) {
        List *allCircles = getCircles(image);
        Circle *circleNode;
        void *circleElement;

        ListIterator iterator = createIterator(allCircles);

        while ((circleElement = nextElement(&iterator))) {
            circleNode = (Circle *)circleElement;

            if (circleNode->otherAttributes == NULL) {
                // printf("Checking\n");
                freeListNotData(allCircles);
                free(allCircles);
                allCircles = NULL;
                return false;
            } else if (circleNode->otherAttributes->length > 0) {
                if (!areOtherAttrValid(circleNode->otherAttributes)) {
                    freeListNotData(allCircles);
                    free(allCircles);
                    allCircles = NULL;
                    return false;
                }
            }
        }

        if (allCircles != NULL) {
            freeListNotData(allCircles);
            free(allCircles);
            allCircles = NULL;
        }
    }

    if (image->rectangles->length > 0) {
        List *allRects = getRects(image);
        Rectangle *rectNode;
        void *rectElement;

        ListIterator iterator = createIterator(allRects);

        while ((rectElement = nextElement(&iterator))) {
            rectNode = (Rectangle *)rectElement;

            if (rectNode->otherAttributes == NULL) {
                freeListNotData(allRects);
                free(allRects);
                allRects = NULL;
                return false;
            } else if (rectNode->otherAttributes->length > 0) {
                if (!areOtherAttrValid(rectNode->otherAttributes)) {
                    freeListNotData(allRects);
                    free(allRects);
                    allRects = NULL;
                    return false;
                }
            }
        }

        if (allRects != NULL) {
            freeListNotData(allRects);
            free(allRects);
            allRects = NULL;
        }
    }

    if (image->paths->length > 0) {
        List *allPaths = getPaths(image);
        Path *pathNode;
        void *pathElement;

        ListIterator iterator = createIterator(allPaths);

        while ((pathElement = nextElement(&iterator))) {
            pathNode = (Path *)pathElement;

            if (pathNode->otherAttributes == NULL) {
                freeListNotData(allPaths);
                free(allPaths);
                allPaths = NULL;
                return false;
            } else if (pathNode->otherAttributes->length > 0) {
                if (!areOtherAttrValid(pathNode->otherAttributes)) {
                    freeListNotData(allPaths);
                    free(allPaths);
                    allPaths = NULL;
                    return false;
                }
            }
        }

        if (allPaths != NULL) {
            freeListNotData(allPaths);
            free(allPaths);
            allPaths = NULL;
        }
    }

    return true;
}

bool areNumsValid(SVGimage *image)
{
    List *allCircles = getCircles(image);

    if (allCircles != NULL) {
        if (allCircles->length > 0) { // At least one circle node
            ListIterator circleIterator = createIterator(allCircles);
            void *circleElement;
            Circle *circleNode;
            
            while((circleElement = nextElement(&circleIterator))) {
                circleNode = (Circle *)circleElement;

                if (circleNode->r < 0) {
                    freeListNotData(allCircles);
                    free(allCircles);
                    allCircles = NULL;
                    return false;
                }

                if (circleNode->units == NULL) {
                    freeListNotData(allCircles);
                    free(allCircles);
                    allCircles = NULL;
                    return false;
                }
            }
        }
    }

    if (allCircles != NULL) {
        freeListNotData(allCircles);
        free(allCircles);
    }

    List *allRects = getRects(image);
    if (allRects != NULL) {
        if (allRects->length > 0) { // At least one rectangle node
            ListIterator rectIterator = createIterator(allRects);
            void *rectElement;
            Rectangle *rectNode;

            while((rectElement = nextElement(&rectIterator))) {
                rectNode = (Rectangle *)rectElement;

                if (rectNode->width < 0 || rectNode->height < 0) {
                    freeListNotData(allRects);
                    free(allRects);
                    allRects = NULL;
                    return false;
                }

                if (rectNode->units == NULL) {
                    freeListNotData(allRects);
                    free(allRects);
                    allRects = NULL;
                    return false;
                }
            }
        }
    }

    if (allRects != NULL) {
        freeListNotData(allRects);
        free(allRects);
    }

    return true;
}

bool arePathsValid(SVGimage *image)
{
    List *allPaths = getPaths(image);

    if (allPaths->length > 0) {
        ListIterator pathIterator = createIterator(allPaths);
        void *pathElement;
        Path *pathNode;

        while ((pathElement = nextElement(&pathIterator))) {
            pathNode = (Path *)pathElement;

            if (pathNode->data == NULL) {
                freeListNotData(allPaths);
                free(allPaths);
                allPaths = NULL;
                return false;
            }
        }
    }

    if (allPaths != NULL) {
        freeListNotData(allPaths);
        free(allPaths);
    }

    return true;
}

bool areSVGNonListValid(SVGimage *image)
{
    if (image->namespace == NULL || strlen(image->namespace) == 0) return false;

    if (image->title == NULL) return false;

    if (image->description == NULL) return false;

    return true;
}

bool areSVGAttrValid(SVGimage *image)
{
    if (image == NULL) return false;

    List *circles = getCircles(image);
    List *rects = getRects(image);
    List *groups = getGroups(image);
    List *paths = getPaths(image);

    // if (image->circles->length > 0) {

    //     ListIterator circleIterator = createIterator(circles);
    //     void *circleElement;
    //     Circle *circleNode;

    //     while ((circleElement = nextElement(&circleIterator))) {

    //         circleNode

    //     }

    // }
    // if (!areOtherAttrValid(circles)) return false;
    // if (!areOtherAttrValid(rects)) return false;
    // if (!areOtherAttrValid(groups)) return false;
    // if (!areOtherAttrValid(paths)) return false;
    if (!areOtherAttrValid(image->otherAttributes)) return false;

    freeListNotData(circles);
    free(circles);
    freeListNotData(rects);
    free(rects);
    freeListNotData(groups);
    free(groups);
    freeListNotData(paths);
    free(paths);
    
    return true;
}

// bool areRectsInvalid(List *imageRects)
// {

//     if (imageRects == NULL) return true;

//     if (imageRects->length > 0) {


//         ListIterator rectIterator = createIterator(imageRects);
//         void *rectElement;
//         Rectangle *rectNode;

//         while ((rectElement = nextElement(&rectIterator))) {

//             rectNode = (Rectangle *)rectElement;

//             if (rectNode->height < 0) return true;
//             if (rectNode->width < 0) return true;
//             if (rectNode->units == NULL) return true;
//             if (rectNode->otherAttributes == NULL) return true;

//             if (rectNode->otherAttributes->length > 0) {
//                 if (areOtherAttrValid(rectNode->otherAttributes) == false) return true;
//             }

//         }

//     }


//     return false; // All rectangles passed the test
// }

// bool areCirclesInvalid(List *imageCircles)
// {
//     if (imageCircles == NULL) return true;

//     if (imageCircles->length > 0) {


//         ListIterator circleIterator = createIterator(imageCircles);
//         void *circleElement;
//         Circle *circleNode;

//         while ((circleElement = nextElement(&circleIterator))) {

//             circleNode = (Circle *)circleElement;

//             if (circleNode->r < 0) return true;
//             if (circleNode->units == NULL) return true;
//             if (circleNode->otherAttributes == NULL) return true;
            
//             if (circleNode->otherAttributes->length > 0) {
//                 if (areOtherAttrValid(circleNode->otherAttributes) == false) return true;
//             }

//         }

//     }

//     return false;
// }

// bool arePathsInvalid(List *imagePaths)
// {
//     if (imagePaths == NULL) return true;

//     if (imagePaths->length > 0) {


//         ListIterator pathIterator = createIterator(imagePaths);
//         void *pathElement;
//         Path *pathNode;

//         while ((pathElement = nextElement(&pathIterator))) {

//             pathNode = (Path *)pathElement;

//             if (pathNode->data == NULL) return true;
//             if (pathNode->otherAttributes == NULL) return true;

//             if (pathNode->otherAttributes->length > 0) {
//                 if (areOtherAttrValid(pathNode->otherAttributes) == false) return true;
//             }

//         }

//     }

//     return false;
// }

// bool isSVGInvalid(SVGimage *image)
// {
//     if (image == NULL) return true;

//     if (strlen(image->namespace) == 0) return true;
//     if (image->namespace == NULL) return true;

//     if (image->title == NULL) return true;

//     if (image->title == NULL) return true;

//     if (image->circles == NULL) return true;
//     if (image->rectangles == NULL) return true;
//     if (image->groups == NULL) return true;
//     if (image->paths == NULL) return true;
//     if (image->otherAttributes == NULL) return true;
    
//     if (image->otherAttributes->length > 0) {
//         if (areOtherAttrValid(image->otherAttributes) == false) return true;
//     }

//     return false;
// }

// bool areGroupsInvalid(List *imageGroups)
// {
//     if (imageGroups == NULL) return true;

//     if (imageGroups->length > 0) {

//         ListIterator groupIterator = createIterator(imageGroups);
//         void *groupElement;
//         Group *groupNode;

//         while ((groupElement = nextElement(&groupIterator))) {

//             groupNode = (Group *)groupElement;

//             if (groupNode->circles == NULL) return true;
//             if (groupNode->circles->length > 0) {
//                 if (areCirclesInvalid(groupNode->circles) == false) return true;
//             }

//             if (groupNode->rectangles == NULL) return true;
//             if (groupNode->rectangles->length > 0) {
//                 if (areRectsInvalid(groupNode->rectangles) == false) return true;
//             }

//             if (groupNode->paths == NULL) return true;
//             if (groupNode->paths->length > 0) {
//                 if (arePathsInvalid(groupNode->paths) == false) return true;
//             }

//             if (groupNode->groups == NULL) return true;
//             if (groupNode->groups->length > 0) {
//                 if (areGroupsInvalid(groupNode->groups) == false) return true;
//             }

//             if (groupNode->otherAttributes == NULL) return true;
//             if (groupNode->otherAttributes->length) {
//                 if (areOtherAttrValid(groupNode->otherAttributes) == false) return true;
//             }

//         }

//     }

//     return false;
// }

bool imageViolatesConstraints(SVGimage *image)
{   
    // bool violates = true;

    /* Check all lists are initialized and not NULL */
    if (!(areListsValid(image))) return true; // One or more lists are NULL

    /* Numbers are in valid ranges i.e. >= 0 and NOT neg*/
    if (!(areNumsValid(image))) return true;

    /* Check path's data */
    if (!(arePathsValid(image))) return true;

    /* Check SVG's title, namespace and desc */
    if (!(areSVGNonListValid(image))) return true;

    /* Check attributes */
    if (!(areSVGAttrValid(image))) return true;
    
    // Check SVG
    // if (isSVGInvalid(image)) return true;

    // Check Rectangles
    // if (areRectsInvalid(image->rectangles)) return true; // At least one rectangle was invalid
    
    // Check Circles
    // if (areCirclesInvalid(image->circles)) return true; // At least one circle was invalid

    // Check Paths
    // if (arePathsInvalid(image->paths)) return true;

    // Check Groups
    // if (areGroupsInvalid(image->groups)) return true;


    /* Read the SVGParser.h for more constraints */

    // return false if it doesn't violate constraints
    return false;
}

bool validateImage(SVGimage *image, char *schemafile)
{
    if (image == NULL || schemafile == NULL || strlen(schemafile) == 0) return false;

    xmlDoc *doc = NULL;
    xmlNode *root_node = NULL;

    setupDoc(image, &root_node, &doc);

    // Validate the doc created from image
    if (!(validateXmlDoc(schemafile, doc))) { // Not a valid xml doc
        xmlFreeDoc(doc);
        return false;
    }

    xmlFreeDoc(doc);

    return true;
}

void setupDoc(SVGimage *image, xmlNode **root_node, xmlDoc **doc)
{
    // printf("ENTERING setupDoc\n");
    *doc = xmlNewDoc(BAD_CAST "1.0"); // Need BAD_CAST otherwise compiler throws bare warnings n shiiii
    *root_node = xmlNewNode(NULL, BAD_CAST "svg");
    xmlDocSetRootElement(*doc, *root_node);
    
    if (image->namespace != NULL && strlen(image->namespace) > 0) { // there's a namespace add it to the doc
        xmlNsPtr namespace = xmlNewNs(*root_node, BAD_CAST image->namespace, NULL);
        xmlSetNs(*root_node, namespace); // Need this so namespace is set properly for the xml doc
    }


    /* SVG's children */
    if (image->title != NULL && strlen(image->title) > 0) {
        xmlNewChild(*root_node, NULL, BAD_CAST "title", BAD_CAST image->title);
    }
    if (image->description != NULL && strlen(image->description) > 0) {
        xmlNewChild(*root_node, NULL, BAD_CAST "desc", BAD_CAST image->description);
    }
    if (image->otherAttributes->length) {
        attrToDoc(image->otherAttributes, *root_node);
    }
    if (image->rectangles->length) {
        rectToDoc(image->rectangles, *root_node);
    }
    if (image->circles->length) {
        circleToDoc(image->circles, *root_node);
    }
    if (image->paths->length) {
        pathToDoc(image->paths, *root_node);
    }
    if (image->groups->length) {
        groupToDoc(image->groups, *root_node);
    }
}

void attrToDoc(List *listToTraverse, xmlNode *parentNode)
{
    if (listToTraverse == NULL || parentNode == NULL) return;

    void *attrElement;
    List *attrList = listToTraverse;
    ListIterator iterator = createIterator(attrList);
    Attribute *attrNode;

    while ((attrElement = nextElement(&iterator))) {
        attrNode = (Attribute *)attrElement;
        xmlNewProp(parentNode, BAD_CAST attrNode->name, BAD_CAST attrNode->value);
    }
}

void groupToDoc(List *listToTraverse, xmlNode *parentNode)
{
    void *groupElement;
    List *groupList = listToTraverse;
    ListIterator iterator = createIterator(groupList);
    Group *groupNode;
    xmlNode *xmlGroupNode;

    while ((groupElement = nextElement(&iterator))) {
        groupNode = (Group *)groupElement;
        xmlGroupNode = xmlNewChild(parentNode, NULL, BAD_CAST "g", NULL);
        
        if (groupNode->otherAttributes != NULL) {
            if (groupNode->otherAttributes->length) attrToDoc(groupNode->otherAttributes, xmlGroupNode);
        }

        /* Order to add to doc is rect, circle, path and then group */
        if (groupNode->rectangles != NULL) {
            if (groupNode->rectangles->length) rectToDoc(groupNode->rectangles, xmlGroupNode);
        }

        if (groupNode->circles != NULL) {
            if (groupNode->circles->length) circleToDoc(groupNode->circles, xmlGroupNode);
        } 
        
        if (groupNode->paths != NULL) {
            if (groupNode->paths->length) pathToDoc(groupNode->paths, xmlGroupNode);
        }

        if (groupNode->groups != NULL) {
            if (groupNode->groups->length) groupToDoc(groupNode->groups, xmlGroupNode);
        }
    }

}

void pathToDoc(List *listToTraverse, xmlNode *parentNode)
{
    if (listToTraverse == NULL || parentNode == NULL) return;

    void *pathElement;
    List *pathList = listToTraverse;
    ListIterator iterator = createIterator(pathList);
    Path *pathNode;
    xmlNode *xmlPathNode;

    while ((pathElement = nextElement(&iterator))) {
        pathNode = (Path *)pathElement;
        xmlPathNode = xmlNewChild(parentNode, NULL, BAD_CAST "path", NULL);

        xmlNewProp(xmlPathNode, BAD_CAST "d", BAD_CAST pathNode->data);
        
        if (pathNode->otherAttributes != NULL) {
            if (pathNode->otherAttributes->length) attrToDoc(pathNode->otherAttributes, xmlPathNode);
        }
    }
}

void circleToDoc(List *listToTraverse, xmlNode *parentNode)
{
    if (listToTraverse == NULL || parentNode == NULL) return;

    void *circleElement;
    List *circleList = listToTraverse;
    ListIterator iterator = createIterator(circleList);
    Circle *circleNode;
    xmlNode *xmlCircleNode;
    char buffer[256];

    while ((circleElement = nextElement(&iterator))) {
        circleNode = (Circle *)circleElement;
        xmlCircleNode = xmlNewChild(parentNode, NULL, BAD_CAST "circle", NULL);

        if (strlen(circleNode->units)) {

            sprintf(buffer, "%f%s", circleNode->cx, circleNode->units);
            xmlNewProp(xmlCircleNode, BAD_CAST "cx", BAD_CAST buffer);
            
            sprintf(buffer, "%f%s", circleNode->cy, circleNode->units);
            xmlNewProp(xmlCircleNode, BAD_CAST "cy", BAD_CAST buffer);
            
            sprintf(buffer, "%f%s", circleNode->r, circleNode->units);
            xmlNewProp(xmlCircleNode, BAD_CAST "r", BAD_CAST buffer);

        } else { // No units

            sprintf(buffer, "%f", circleNode->cx);
            xmlNewProp(xmlCircleNode, BAD_CAST "cx", BAD_CAST buffer);
            
            sprintf(buffer, "%f", circleNode->cy);
            xmlNewProp(xmlCircleNode, BAD_CAST "cy", BAD_CAST buffer);
            
            sprintf(buffer, "%f", circleNode->r);
            xmlNewProp(xmlCircleNode, BAD_CAST "r", BAD_CAST buffer);

        }

        if (circleNode->otherAttributes != NULL) {
            if (circleNode->otherAttributes->length > 0) attrToDoc(circleNode->otherAttributes, xmlCircleNode);
        }

    }
}

void rectToDoc(List *listToTraverse, xmlNode *parentNode)
{
    if (listToTraverse == NULL || parentNode == NULL) return;

    void *rectangleElement;
    List *rectList = listToTraverse;
    ListIterator iterator = createIterator(rectList);
    Rectangle *rectNode;
    xmlNode *xmlRectNode;
    char buffer[256];

    while ((rectangleElement = nextElement(&iterator))) {
        rectNode = (Rectangle *)rectangleElement;
        xmlRectNode = xmlNewChild(parentNode, NULL, BAD_CAST "rect", NULL);

        if (strlen(rectNode->units)) {

            sprintf(buffer, "%f%s", rectNode->x, rectNode->units);
            xmlNewProp(xmlRectNode, BAD_CAST "x", BAD_CAST buffer);
            
            sprintf(buffer, "%f%s", rectNode->y, rectNode->units);
            xmlNewProp(xmlRectNode, BAD_CAST "y", BAD_CAST buffer);
            
            sprintf(buffer, "%f%s", rectNode->width, rectNode->units);
            xmlNewProp(xmlRectNode, BAD_CAST "width", BAD_CAST buffer);
            
            sprintf(buffer, "%f%s", rectNode->height, rectNode->units);
            xmlNewProp(xmlRectNode, BAD_CAST "height", BAD_CAST buffer);

        } else { // No units

            sprintf(buffer, "%f", rectNode->x);
            xmlNewProp(xmlRectNode, BAD_CAST "x", BAD_CAST buffer);
            
            sprintf(buffer, "%f", rectNode->y);
            xmlNewProp(xmlRectNode, BAD_CAST "y", BAD_CAST buffer);
            
            sprintf(buffer, "%f", rectNode->width);
            xmlNewProp(xmlRectNode, BAD_CAST "width", BAD_CAST buffer);
            
            sprintf(buffer, "%f", rectNode->height);
            xmlNewProp(xmlRectNode, BAD_CAST "height", BAD_CAST buffer);

        }

        if (rectNode->otherAttributes != NULL) {
            if (rectNode->otherAttributes->length) attrToDoc(rectNode->otherAttributes, xmlRectNode);
        }

    }
}

bool validateXmlDoc(char *schemafile, xmlDoc *doc/* , char *filename */)
{   
    // Contains code from http://knol2share.blogspot.com/2009/05/validate-xml-against-xsdin-c.html provided by Prof. Nikitenko
    xmlSchemaPtr schema = NULL;
    xmlSchemaParserCtxtPtr ctxt;
    bool valid = false;

    xmlLineNumbersDefault(1);

    ctxt = xmlSchemaNewParserCtxt(schemafile);

    schema = xmlSchemaParse(ctxt);
    xmlSchemaFreeParserCtxt(ctxt);


    int errors = -1/* , validFile */;
    xmlSchemaValidCtxtPtr validCtxt;

    if (doc != NULL) {

        validCtxt = xmlSchemaNewValidCtxt(schema);
        
        xmlSchemaSetValidErrors(validCtxt, (xmlSchemaValidityErrorFunc) fprintf, (xmlSchemaValidityWarningFunc) fprintf, stderr);
        errors = xmlSchemaValidateDoc(validCtxt, doc);

        if (errors == 0) valid = true;

        // printf("Errors contains %d\n", errors);

        xmlSchemaFreeValidCtxt(validCtxt);

        if (schema != NULL) xmlSchemaFree(schema);

        xmlSchemaCleanupTypes();
    }
    
    return valid;
}

void freeListNotData(List *list)
{
    if (list == NULL){
		return;
	}
	
	if (list->head == NULL && list->tail == NULL){
		return;
	}
	
	Node* tmp;
	
	while (list->head != NULL){
		// list->deleteData(list->head->data);
		tmp = list->head;
		list->head = list->head->next;
		free(tmp);
	}
	
	list->head = NULL;
	list->tail = NULL;
	list->length = 0;
}

void dummyDelete(void *data)
{
    return;
}

void addOtherAttributes(xmlAttr *attr, List *listOfOtherAttr, char *parentOfAttr)
{
    
    Attribute *currAttr;

    for (; attr != NULL && strcmp(parentOfAttr, (char*)attr->parent->name) == 0; attr = attr->next) { // Checks if the attribute belongs to the correct parent being parsed


            xmlNode *value = attr->children;
            char *attrName = (char *)attr->name;
            char *cont = (char *)(value->content);

            /* Avoid adding non-other attributes into other attributes list. */
            while (((strcasecmp("d", attrName) == 0 || strcasecmp("cx", attrName) == 0 || strcasecmp("cy", attrName) == 0 || strcasecmp("r", attrName) == 0 || strcasecmp("width", attrName) == 0 || strcasecmp("height", attrName) == 0 || strcasecmp("x", attrName) == 0 || strcasecmp("y", attrName) == 0) && strcasecmp("svg", parentOfAttr) != 0)) {
                if (attr->next == NULL) return; // prevents non other attributes from being added if they're the last attribute in parent node
                attr = attr->next;
                // printf("TRIGGERED\n");
                value = attr->children;
                // printf("HOLA\n");
                attrName = (char *)attr->name;
                cont = (char *)(value->content);
            }

            if (attr == NULL) {
                // printf("HUH!?\n");
                break;
            }

            // printf("DAP ME UP FAM\n");

            currAttr = (Attribute *)malloc(sizeof(Attribute)); // Create a pointer for the attribute that will save the xmlAttr data

            // Place attribute name into Attribute struct
            currAttr->name = (char *)calloc(strlen(attrName) + 1, sizeof(char));
            strcpy(currAttr->name, attrName);
            // printf("DAP ME UP FAM2\n");
            // Place attribute value into Attribute struct
            currAttr->value = (char *)calloc(strlen(cont) + 1, sizeof(char));
            strcpy(currAttr->value, cont);
            // printf("DAP ME UP FAM3\n");
            // printf("\tattribute name: %s, attribute value = %s\n", attrName, cont);
            // printf("\tcurrAttr -- attribute name: %s, attribute value = %s\n", currAttr->name, currAttr->value);
            // if (strcmp("r"))
            insertBack(listOfOtherAttr, currAttr);
            // if (strcmp(parentOfAttr, "g") == 0) printf("\nWOT DE HECK\n\n");
            // printf("DAP ME UP FAM4\n");
        }
}

void parseSVG(xmlNode *aNode, SVGimage *image)
{
    xmlNode *cur_node = NULL;

    /* libXmlExample.c code Prof Nikitenko provided. */
    cur_node = aNode;
    for (; cur_node != NULL; cur_node = cur_node->next) {
        // if (cur_node->type == XML_ELEMENT_NODE) {
        //     printf("node type: Element, name: %s\n", cur_node->name);
        // }

            /* Get namespace (may be empty) */
        if (cur_node->ns != NULL) {
        
            xmlNs *namespace = cur_node->ns;
            
            if (strlen((char *)namespace->href) > 255) { // Check if length larger than array size, truncate the rest and fit what you can.
                
                strncpy(image->namespace, (char *)namespace->href, 255);
                image->namespace[255] = '\0';
            } else if (strlen((char *)namespace->href) == 0 || (char *)namespace->href == NULL) {
                
                strcpy(image->namespace, "");
            } else {
                
                strcpy(image->namespace, (char *)namespace->href);
            }
        }

        /* Title and description are child nodes of svg!! */
        /* Get title (may be empty) */
        if (strcasecmp((char *)cur_node->name, "title") == 0) {
            
            char *title = (char *)cur_node->children->content;
            // printf("(REMOVE)TITLE CONTENT: %s\n", title);
            if (strlen(title) > 255) {

                strncpy(image->title, title, 255);
                image->title[255] = '\0';
            } else if (strlen(title) == 0 || title == NULL) {

                strcpy(image->title, "");
            } else {

                strcpy(image->title, title);
            }
        }

        /* Get description (may be empty) */
        if (strcasecmp((char *)cur_node->name, "desc") == 0) {

            char *desc = (char *)cur_node->children->content;
            // printf("(REMOVE)DESC CONTENT: %s\n", desc);
            if (strlen(desc) > 255) {

                strncpy(image->description, desc, 255);
                image->title[255] = '\0';
            } else if (strlen(desc) == 0 || desc == NULL) {

                strcpy(image->description, "");
            } else {

                strcpy(image->description, desc);
            }
        }

        /* MIGHT WANNA CHANGE HOW I'M USING insertBack since it's adding the first node at the back instead of making the last parsed node the last node. */
        for (; strcasecmp((char*)cur_node->name, "svg") != 0 && cur_node->type == XML_ELEMENT_NODE; cur_node = cur_node->next) {
            if (strcasecmp((char *)cur_node->name, "path") == 0) {
                
                /* Paths */
                Path *currPathElement = (Path *)calloc(1, sizeof(Path));
                parsePaths(cur_node, currPathElement);
                insertBack(image->paths, currPathElement);


            } else if (strcasecmp((char *)cur_node->name, "circle") == 0) {

                /* Circles */
                Circle *currCircleElement = (Circle *)calloc(1, sizeof(Circle));
                parseCircles(cur_node, currCircleElement);
                insertBack(image->circles, currCircleElement);

            } else if (strcasecmp((char *)cur_node->name, "rect") == 0) {

                /* Rectangles */
                Rectangle *currRectElement = (Rectangle *)calloc(1, sizeof(Rectangle));
                parseRectangles(cur_node, currRectElement);
                insertBack(image->rectangles, currRectElement);

            } else if (strcasecmp((char *)cur_node->name, "g") == 0) {

                /* Groups */
                Group *currGroupElement = (Group *)calloc(1, sizeof(Group));
                parseGroups(cur_node->children, currGroupElement);
                insertBack(image->groups, currGroupElement);

            }
        }
        
        // Adds attributes to otherAttributes list
        addOtherAttributes(cur_node->properties, image->otherAttributes, "svg");

        if (cur_node->next == NULL && cur_node->children != NULL) { // Only go one level deeper if there's another node (tag) to traverse

            cur_node = cur_node->children; // Goes 1 level deeper
        }
    }
}

void parsePaths(xmlNode *aNode, Path *currPathElement) /* Change the return type of this later */
{
    xmlNode *cur_node = NULL;
    cur_node = aNode;
    // currPathElement->data = (char *)calloc(1000, sizeof(char));

    // printf("OH HAAAAA -- %s\n", cur_node->name);

    
    xmlAttr *attr;
    
    
    /* Grab data attribute */
    for (attr = cur_node->properties; attr != NULL; attr = attr->next) {
        xmlNode *value = attr->children;
        char *attrName = (char *)attr->name;
        char *cont = (char *)(value->content);

        if (strcasecmp(attrName, "d") == 0) {
            // printf("HELLO THERERERERE\n");
            if (strlen(cont) > 0) {
                // currPathElement->data = realloc(currPathElement->data, sizeof(char *) * strlen(cont) + 1);
                currPathElement->data = (char *)calloc(strlen(cont) + 1, sizeof(char));
                strcpy(currPathElement->data, cont);
                // printf("PLEASE WORK (INSIDE COND): DATA:%s\n", currPathElement->data);
            }
        }
    }
    currPathElement->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);
    addOtherAttributes(cur_node->properties, currPathElement->otherAttributes, "path");
    // printf("PLEASE WORK: DATA:%s\n", currPathElement->data);
}

void unitParser(char *storeUnits, char *searchForUnits)
{
    if (strlen(storeUnits) > 0) return; // No need to parse for units since it already has them

    int index = 0;
    for (; index < strlen(searchForUnits) && !isalpha(searchForUnits[index]); index++);

    if (index != strlen(searchForUnits)) {
        strncpy(storeUnits, searchForUnits + index, strlen(searchForUnits) - index);
        storeUnits[strlen(searchForUnits)] = '\0';
    }
}

void parseCircles(xmlNode *aNode, Circle *currCircleElement)
{
    xmlNode *cur_node = NULL;
    cur_node = aNode;

    currCircleElement->cx = 0;
    currCircleElement->cy = 0;
    currCircleElement->r = 0;
    strcpy(currCircleElement->units, "");

    xmlAttr *attr;

    /* Grab non-other attributes */
    for (attr = cur_node->properties; attr != NULL; attr = attr->next) {
        xmlNode *value = attr->children;
        char *attrName = (char *)attr->name;
        char *cont = (char *)(value->content);

        if (strcasecmp(attrName, "cx") == 0) {
            // printf("HELLO THERERERERE\n");
            if (strlen(cont) > 0) {
                currCircleElement->cx = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): CX:%f\n", currCircleElement->cx);
                unitParser(currCircleElement->units, cont);
            }
        } else if (strcasecmp(attrName, "cy") == 0) {
            if (strlen(cont) > 0) {
                currCircleElement->cy = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): CY:%f\n", currCircleElement->cy);
                unitParser(currCircleElement->units, cont);
            }
        } else if (strcasecmp(attrName, "r") == 0) {
            if (strlen(cont) > 0) {
                currCircleElement->r = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): R:%f\n", currCircleElement->r);
                unitParser(currCircleElement->units, cont);
            }
        }
    }
    currCircleElement->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);
    addOtherAttributes(cur_node->properties, currCircleElement->otherAttributes, "circle");

}

void parseRectangles(xmlNode *aNode, Rectangle *currRectElement)
{
    xmlNode *cur_node = NULL;
    cur_node = aNode;

    currRectElement->x = 0;
    currRectElement->y = 0;
    currRectElement->height = 0;
    currRectElement->width = 0;
    strcpy(currRectElement->units, "");

    // printf("OH HAAAAA -- %s\n", cur_node->name);

    xmlAttr *attr;

    /* Grab non-other attributes */
    for (attr = cur_node->properties; attr != NULL; attr = attr->next) {
        xmlNode *value = attr->children;
        char *attrName = (char *)attr->name;
        char *cont = (char *)(value->content);

        if (strcasecmp(attrName, "x") == 0) {
            // printf("HELLO THERERERERE\n");
            if (strlen(cont) > 0) {
                currRectElement->x = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): X:%f\n", currRectElement->x);
                unitParser(currRectElement->units, cont);
            }
        } else if (strcasecmp(attrName, "y") == 0) {
            if (strlen(cont) > 0) {
                currRectElement->y = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): Y:%f\n", currRectElement->y);
                unitParser(currRectElement->units, cont);
            }
        } else if (strcasecmp(attrName, "width") == 0) {
            if (strlen(cont) > 0) {
                currRectElement->width = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): WIDTH:%f\n", currRectElement->width);
                unitParser(currRectElement->units, cont);
            }
        } else if (strcasecmp(attrName, "height") == 0) {
            if (strlen(cont) > 0) {
                currRectElement->height = atof(cont);
                // printf("PLEASE WORK (INSIDE COND): HEIGHT:%f\n", currRectElement->height);
                unitParser(currRectElement->units, cont);
            }
        }
    }
    currRectElement->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);
    addOtherAttributes(cur_node->properties, currRectElement->otherAttributes, "rect");
    // printf("PLEASE WORK: X: %f Y: %f, WIDTH: %f HEIGHT: %f UNITS: %s\n", currRectElement->x, currRectElement->y, currRectElement->width, currRectElement->height, currRectElement->units);
}

void parseGroups(xmlNode *aNode, Group *currGroupElement)
{
    xmlNode *cur_node = NULL;
    cur_node = aNode;

    currGroupElement->circles = initializeList(circleToString, deleteCircle, compareCircles);
    currGroupElement->rectangles = initializeList(rectangleToString, deleteRectangle, compareRectangles);
    currGroupElement->groups = initializeList(groupToString, deleteGroup, compareGroups);
    currGroupElement->paths = initializeList(pathToString, deletePath, comparePaths);
    currGroupElement->otherAttributes = initializeList(attributeToString, deleteAttribute, compareAttributes);

    // printf("OH HAAAAA -- node: %s attr: %s\n", cur_node->parent->name, (char *)cur_node->parent->properties->children->content);
    // printf("Parent of parent node: %s attr: %s\n", cur_node->parent->parent->name, (char *)cur_node->parent->parent->properties->children->content);

    for (; cur_node != NULL; cur_node = cur_node->next) {
        for (;cur_node->next != NULL; cur_node = cur_node->next) {
            // printf("NODE IN GROUP LOOP: %s\n", (char *)cur_node->name);
            if (strcasecmp((char *)cur_node->name, "path") == 0) {
                
                /* Paths */
                Path *currPathElement = (Path *)calloc(1, sizeof(Path));
                parsePaths(cur_node, currPathElement);
                insertBack(currGroupElement->paths, currPathElement);

            } else if (strcasecmp((char *)cur_node->name, "circle") == 0) {

                /* Circles */
                Circle *currCircleElement = (Circle *)calloc(1, sizeof(Circle));
                parseCircles(cur_node, currCircleElement);
                insertBack(currGroupElement->circles, currCircleElement);

            } else if (strcasecmp((char *)cur_node->name, "rect") == 0) {

                /* Rectangles */
                Rectangle *currRectElement = (Rectangle *)calloc(1, sizeof(Rectangle));
                parseRectangles(cur_node, currRectElement);
                insertBack(currGroupElement->rectangles, currRectElement);

            } else if (strcasecmp((char *)cur_node->name, "g") == 0) {

                /* Groups */
                Group *nextGroupElement = (Group *)calloc(1, sizeof(Group));
                parseGroups(cur_node->children, nextGroupElement);
                insertBack(currGroupElement->groups, nextGroupElement);
            }
        }

        // Adds attributes to otherAttributes list
        addOtherAttributes(cur_node->parent->properties, currGroupElement->otherAttributes, "g");
    }
}