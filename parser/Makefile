CFLAGS = -Wall -g -std=c11
BIN = bin/
INC = include/
SRC = src/
XML_PATH = /usr/include/libxml2

# Standard common makefile
parser: ../libsvgparse.so

all: parser test

../libsvgparse.so: $(BIN)SVGParser.o $(BIN)LinkedListAPI.o
	gcc -shared -o $@ $(BIN)SVGParser.o $(BIN)LinkedListAPI.o -lxml2 -lm

$(BIN)SVGParser.o: $(SRC)SVGParser.c $(INC)LinkedListAPI.h $(INC)SVGParser.h
	gcc -c -fpic $(CFLAGS) -I$(XML_PATH) -I$(INC) $(SRC)SVGParser.c -o $(BIN)SVGParser.o

$(BIN)LinkedListAPI.o: $(SRC)LinkedListAPI.c $(INC)LinkedListAPI.h
	gcc -c -fpic $(CFLAGS) -I$(INC) $(SRC)LinkedListAPI.c -o $(BIN)LinkedListAPI.o

test: $(SRC)main.c $(BIN)LinkedListAPI.o $(BIN)SVGParser.o
	$(CC) $(CFLAGS) -I$(XML_PATH) -I$(INC) $(BIN)LinkedListAPI.o $(BIN)SVGParser.o $(SRC)main.c -lxml2 -lm -o $(BIN)$@

valgrind: all # Run valgrind to check for mem leaks
	valgrind --leak-check=full --show-leak-kinds=all -v --track-origins=yes $(BIN)test

debug: all # Run GDB debugger
	gdb $(BIN)test
# hello there
run:
	$(BIN)test

clean:
	rm -f $(BIN)*.o $(BIN)*.so $(BIN)test
